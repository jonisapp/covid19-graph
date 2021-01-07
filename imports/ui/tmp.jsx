  // useEffect(() => {
  //   Meteor.call('getData', (err, resData) => {
  //     var landsNames_arr = [];

  //     delete resData['undefined'];

  //     console.log(resData);

  //     const normalizedData = {};

  //     Object.keys(resData).forEach(landKey => {
  //       normalizedData[landKey] = [];
  //     });

  //     const firstDate = "2020-01-22";
  //     const lastDate = getYesterdayDateISO();

  //     Object.keys(normalizedData).forEach(landKey => {
  //       const landCurrentData = {}
  //       resData[landKey].forEach(record => {
  //         landCurrentData[record.date] = record;
  //       });

  //       let currentDate = firstDate;
  //       let landPreviousConfirmedValue = 0;
  //       let landPreviousRecoveredValue = 0;
  //       let landPreviousDeathsValue = 0;

  //       while(currentDate <= lastDate) {
  //         const landCurrentConfirmedValue = landCurrentData[currentDate] ?
  //           (landCurrentData[currentDate]["Confirmés"] > landPreviousConfirmedValue ? landCurrentData[currentDate]["Confirmés"] : landPreviousConfirmedValue) : landPreviousConfirmedValue;
  //         const landCurrentRecoveredValue = landCurrentData[currentDate] ?
  //           (landCurrentData[currentDate]["Rétablis"] > landPreviousRecoveredValue ? landCurrentData[currentDate]["Rétablis"] : landPreviousRecoveredValue) : landPreviousRecoveredValue;
  //         const landCurrentDeathsValue = landCurrentData[currentDate] ? landCurrentData[currentDate]["Décédés"] : landPreviousDeathsValue;
  //         normalizedData[landKey].push({
  //           date: currentDate,
  //           "Confirmés": landCurrentConfirmedValue,
  //           "Rétablis": landCurrentRecoveredValue,
  //           "Décédés": landCurrentDeathsValue,
  //           "Existants": landCurrentConfirmedValue - landCurrentRecoveredValue - landCurrentDeathsValue
  //         });
  //         landPreviousConfirmedValue = landCurrentConfirmedValue;
  //         landPreviousRecoveredValue = landCurrentRecoveredValue;
  //         landPreviousDeathsValue = landCurrentDeathsValue;
  //         currentDate = getNextDateISO(currentDate);
  //       }
  //       if(interpolate) {
  //         interpolateExisting(normalizedData[landKey]);
  //       }
  //     });

  //     let worldData = [];
  //     let currentDate = firstDate;

  //     console.log(normalizedData);
      
  //     for(let i = 0; currentDate <= lastDate; ++i) {
  //       let worldConfirmedValue = 0;
  //       let worldRecoveredValue = 0;
  //       let worldDeathsValue = 0;

  //       Object.keys(normalizedData).forEach(landkey => {
  //         worldConfirmedValue += normalizedData[landkey][i]["Confirmés"];
  //         worldRecoveredValue += normalizedData[landkey][i]["Rétablis"];
  //         worldDeathsValue += normalizedData[landkey][i]["Décédés"];
  //       });
  //       worldData.push({
  //         date: currentDate,
  //         "Confirmés": worldConfirmedValue,
  //         "Rétablis": worldRecoveredValue,
  //         "Décédés": worldDeathsValue,
  //         "Existants": worldConfirmedValue - worldRecoveredValue - worldDeathsValue
  //       });
  //       currentDate = getNextDateISO(currentDate);
  //     }

  //     const worldDataObj = {}
  //     worldData.forEach(record => {
  //       worldDataObj[record.date] = record;
  //     });

  //     const worldWithoutChina = worldData.map((record, i) => {
  //       return {
  //         date: record.date,
  //         "Confirmés": record["Confirmés"] - normalizedData["China"][i]["Confirmés"],
  //         "Rétablis": record["Rétablis"] - normalizedData["China"][i]["Rétablis"],
  //         "Décédés": record["Décédés"] - normalizedData["China"][i]["Décédés"],
  //         "Existants": record["Existants"] - normalizedData["China"][i]["Existants"]
  //       }
  //     });

  //     console.log(worldData);
      
  //     setWorldData(worldData);
  //     setWorldDataObj(worldDataObj);
  //     setData({World: worldData , "World, excl. China": worldWithoutChina, ...resData});
  //     setLandsNames(["World", "World, excl. China", ...landsNames_arr.sort((a, b) => resData[a][resData[a].length-1]['Confirmés'] < resData[b][resData[b].length-1]['Confirmés'] ? 1 : -1)]);
  //   });
  // }, []);