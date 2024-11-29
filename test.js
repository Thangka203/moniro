const lines = buffer.split("\n");
          buffer = lines.pop();
          let allNumericValues = [];
          for (const line of lines) {
            const numericValues = extractNumericValues(line).flat();
            allNumericValues = [...allNumericValues, ...numericValues];


            while (allNumericValues.length >= 4) {
              const currentGroup = allNumericValues.slice(0, 4);
              allNumericValues = allNumericValues.slice(4);

              const locationData = convertDataToObject(currentGroup);

              if (locationData.latitude === 0 || locationData.longitude === 0) {
                allNumericValues = [];
                continue;
              }
              console.log("locationData: ", locationData);

              addMarker(locationData);
              list.push(locationData);

              // Post data to server
              await postData({ ...locationData, date: today });
              allNumericValues = []; // Reset mảng sau khi xử lý
            }
          }