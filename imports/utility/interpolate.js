export const interpolateExisting = (sortedData) => {
    let i = 0; let j = 1;
    while (i + j < sortedData.length) {
        let alter = false;
        while(typeof sortedData[i + j] !== 'undefined') {
            if(sortedData[i]["Confirmés"] === sortedData[i + j]["Confirmés"]
                || sortedData[i]["Rétablis"] === sortedData[i + j]["Rétablis"]
            ) {
                ++j;
                alter = true;
            } else {
                break;
            }
        }
        if (alter) {
            for (let k = i + 1, l = 1; k <= i + j - 1; ++k) {
                if(typeof sortedData[i+j] !== 'undefined') {
                    const confirmed = parseInt(sortedData[i]["Confirmés"] + (((sortedData[i + j]["Confirmés"] - sortedData[i]["Confirmés"]) / j) * l));
                    const recovered = parseInt(sortedData[i]["Rétablis"] + (((sortedData[i + j]["Rétablis"] - sortedData[i]["Rétablis"]) / j) * l));
                    const deaths = parseInt(sortedData[i]["Décédés"] + (((sortedData[i + j]["Décédés"] - sortedData[i]["Décédés"]) / j) * l));
                    sortedData[k]["Confirmés"] = confirmed;
                    sortedData[k]["Rétablis"] = recovered;
                    sortedData[k]["Décédés"] = deaths;
                    sortedData[k]["Existants"] = confirmed - recovered - deaths;
                    ++l;
                }
            }
        }
        i = i + j;
        j = 1;
    }
};

const getNextDateISO = (date_iso) => {
    let nextDate = new Date(date_iso);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate.toISOString().substr(0, 10);
}

export const getAverageGradient = (data, steps, criterion) => {
    const gradients = [];

    for(let i = 0; i < steps; ++i) {
      const previousValue = data[data.length -2 - i][criterion];
      const nextValue = data[data.length - 1 - i][criterion];
      const gradient = ((nextValue - previousValue) / previousValue) * 100;
      gradients.push({coefficient: steps - i, gradient});
    }
    const totalCoefficient = gradients.reduce((acc, cur) => {
      return acc + cur.coefficient;
    }, 0);
    const gradientsSum = gradients.reduce((acc, cur) => {
      return acc + cur.coefficient * cur.gradient;
    }, 0);
    const averageGradient = gradientsSum / totalCoefficient;

    return averageGradient;
}

export const predict = (data) => {
    if(data.length < 5) {
        return;
    }
    const steps = 3;
    const averageConfirmedGradient = getAverageGradient(data, 5, 'Confirmés');
    const averageRecoveredGradient = getAverageGradient(data, 5, 'Rétablis');
    const averageDeathsGradient = getAverageGradient(data, 5, 'Décédés');

    let currentPredictedDate = data[data.length-1].date;
    let currentPredictedConfirmedGradient = averageConfirmedGradient;
    let currentPredictedRecoveredGradient = averageRecoveredGradient;
    let currentPredictedDeathsGradient = averageDeathsGradient;
    let currentPredictedConfirmed =  parseInt(data[data.length-1]["Confirmés"]);
    let currentPredictedRecovered =  parseInt(data[data.length-1]["Rétablis"]);
    let currentPredictedDeaths =  parseInt(data[data.length-1]["Décédés"]);
    data[data.length-1] = {
        ...data[data.length-1],
        "Confirmés-prédiction": data[data.length-1]["Confirmés"],
        "Rétablis-prédiction": data[data.length-1]["Rétablis"],
        "Décédés-prédiction": data[data.length-1]["Décédés"],
        "Existants-prédiction": data[data.length-1]["Existants"]
    }

    for(let i = 0; i < steps; ++i) {
        currentPredictedDate = getNextDateISO(currentPredictedDate);
        currentPredictedConfirmed = parseInt((currentPredictedConfirmed / 100) * ( 100 + currentPredictedConfirmedGradient));
        currentPredictedRecovered = parseInt((currentPredictedRecovered / 100) * ( 100 + currentPredictedRecoveredGradient));
        currentPredictedDeaths = parseInt((currentPredictedDeaths / 100) * ( 100 + currentPredictedDeathsGradient));
        currentPredictedExisting = currentPredictedConfirmed - currentPredictedRecovered - currentPredictedDeaths;
        data.push({
        date: currentPredictedDate,
        "Confirmés-prédiction": currentPredictedConfirmed,
        "Rétablis-prédiction": currentPredictedRecovered,
        "Décédés-prédiction": currentPredictedDeaths,
        "Existants-prédiction": currentPredictedExisting
        });
    }
}