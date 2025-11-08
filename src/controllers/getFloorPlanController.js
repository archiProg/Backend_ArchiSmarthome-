const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { querysAsync } = require("../db/sqlasync"); // adjust the path if needed
require("dotenv").config();

const getFloorPlan = async (req, res) => {
  const { MemberID } = req.body;
  let whiteList = [];
  let propertyList = [];
  let floorList = [];
  let zoneList = [];
  let deviceList = [];
  let devicecontrolList = [];
  try {
    // Step 1: Get property access list
    const access = await querysAsync(
      "SELECT * FROM fp_propertyaccess WHERE MemberID = ?",
      [MemberID]
    );

    if (access.response && access.response.length > 0) {
      whiteList = access.response;
      const propertyIDs = whiteList.map((w) => w.PropertyID);

      // Step 2: Get properties
      const propertyRes = await querysAsync(
        `SELECT PropertyID as propertyID, PropertyName as name, Image as image, Config as config 
       FROM fp_property 
       WHERE PropertyID IN (${propertyIDs.map(() => "?").join(",")})`,
        propertyIDs
      );

      if (propertyRes.response && propertyRes.response.length > 0) {
        propertyList = propertyRes.response;

        // Step 3: For each property, get floors, zones, devices, and devicecontrols
        for (const p of propertyList) {
          // Floors
          const floorRes = await querysAsync(
            "SELECT * FROM fp_floor WHERE PropertyID = ?",
            [p.propertyID]
          );
          if (floorRes.response && floorRes.response.length > 0) {
            //floorList.push(...floorRes.response);
            /*"propertyID": 1,
                    "floorID": 1,
                    "name": "Floor 1",
                    "image": "https://archismarthome.com/img/FloorPlan/Nakniwas41/NW_Floor1.png",
                    "imageHeight": 1920,
                    "imageWidth": 2560,*/

            floorRes.response.forEach((f) => {
              floorList.push({
                propertyID: f.PropertyID,
                floorID: f.FloorID,
                name: f.FloorName,
                image: f.Image,
                imageHeight: f.ImageHeight,
                imageWidth: f.ImageWidth,
              });
            });
          }

          // Zones
          const zoneRes = await querysAsync(
            "SELECT * FROM fp_zone WHERE PropertyID = ?",
            [p.propertyID]
          );
          if (zoneRes.response && zoneRes.response.length > 0) {
            //zoneList.push(...zoneRes.response);

            /*"propertyID": 1,
                            "floorID": 1,
                            "zoneID": 1,
                            "name": "Floor 1 zone",
                            "zoneImage": null,*/

            zoneRes.response.forEach((z) => {
              zoneList.push({
                propertyID: z.PropertyID,
                floorID: z.FloorID,
                zoneID: z.ZoneID,
                name: z.ZoneName,
                zoneImage: z.ZoneImage,
              });
            });
          }

          // Devices
          const deviceRes = await querysAsync(
            "SELECT fp_device.*, devices.DeviceName, devices.DeviceStyleID FROM fp_device INNER JOIN devices ON fp_device.DeviceID = devices.DeviceID and fp_device.MemberID = devices.MemberID WHERE fp_device.PropertyID = ?",
            [p.propertyID]
          );
          if (deviceRes.response && deviceRes.response.length > 0) {
            //deviceList.push(...deviceRes.response);
            // console.log("Device", deviceRes.response.length, p.name);
            deviceRes.response.forEach((d) => {
              /*"propertyID": 1,
                        "floorID": 1,
                        "zoneID": 1,
                        "memberID": 1849,
                        "deviceID": 1,
                        "deviceType": 1,
                        "name": "GARAGE 1",
                        "x": 1065,
                        "y": 1202,*/

              deviceList.push({
                DeviceID: d.DeviceID,
                DeviceName: d.DeviceName,
                deviceType: d.DeviceStyleID,
                X: d.X,
                Y: d.Y,
                PropertyID: d.PropertyID,
                FloorID: d.FloorID,
                ZoneID: d.ZoneID,
                MemberID: d.MemberID,
              });
            });

            // Step 4: For each device, get device controls
            for (const d of deviceRes.response) {
              const devicecontrolRes = await querysAsync(
                "SELECT * FROM iotserver.devicetcontrol WHERE DeviceID = ? and MemberID = ?",
                [d.DeviceID, d.MemberID]
              );
              if (
                devicecontrolRes.response &&
                devicecontrolRes.response.length > 0
              ) {
                devicecontrolRes.response.forEach((ctrl) => {
                  devicecontrolList.push({
                    controlID: ctrl.ControlID,
                    label: ctrl.Label,
                    v: ctrl.LastValue,
                    DeviceID: d.DeviceID,
                    MemberID: ctrl.MemberID,
                  });
                });
                //devicecontrolList.push(...devicecontrolRes.response);
              }
            }
          }
        }
      }
    }
    let property = [];
    propertyList.forEach((p) => {
      /*"propertyID": 1,
        "name": "Nakniwat 41",
        "image": null,
        "config"*/
      let newfloor = floorList.filter((f) => f.propertyID == p.propertyID);
      newfloor.forEach((nf) => {
        let newzone = zoneList.filter(
          (z) => z.floorID == nf.floorID && z.propertyID == p.propertyID
        );

        newzone.forEach((nz) => {
          let newdevice = deviceList.filter(
            (d) =>
              d.ZoneID == nz.zoneID &&
              d.PropertyID == p.propertyID &&
              d.FloorID == nf.floorID
          );

          newdevice.forEach((nd) => {
            let newdevicecontrol = devicecontrolList.filter(
              (dc) => dc.DeviceID == nd.DeviceID && dc.MemberID == nd.MemberID
            );
            nd.deviceControls = newdevicecontrol.map((dc) => ({
              controlID: dc.controlID,
              label: dc.label,
              v: dc.v,
            }));
          });

          /*"propertyID": 2,
                "floorID": 1,
                "zoneID": 1,
                "memberID": 5,
                "deviceID": 30000,
                "deviceType": 100,
                "name": "Room",
                "x": 225,
                "y": 1,*/
          nz.devices = newdevice.map((nd) => ({
            propertyID: nd.PropertyID,
            floorID: nd.FloorID,
            zoneID: nd.ZoneID,
            memberID: nd.MemberID,
            deviceID: nd.DeviceID,
            deviceType: nd.deviceType,
            name: nd.DeviceName,
            x: nd.X,
            y: nd.Y,
            deviceControls: nd.deviceControls || [],
          }));
        });

        nf.zones = newzone;
      });
      property.push({
        propertyID: p.propertyID,
        name: p.name,
        image: p.image,
        config: p.config,
        floors: newfloor,
      });
    });
    // Step 5: Return combined structure
    return res.status(200).json({
      status: 1,
      property: property,
      message: "success",
      /*whiteList,
        properties: propertyList,
        floors: floorList,
        zones: zoneList,
        devices: deviceList,
        devicecontrols: devicecontrolList*/
    });
  } catch (error) {
    console.error("getFloorPlan error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getFloorPlan 
 
};
