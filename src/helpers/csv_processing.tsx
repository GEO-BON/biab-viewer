import React, { useState, useEffect } from "react";
import proj4 from "proj4";

proj4.defs([
  [
    "EPSG:4326",
    "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
  ],
  [
    "EPSG:3857",
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs",
  ],
]);

export default async function CsvToGeojson(url: string, delimiter: string) {
  return await CsvToArray(url, delimiter).then((r) => {
    let features: any = [];
    features = r?.map((row: any) => {
      if (row.pos[0] > -9999999 && row.pos[0] < 99999999) {
        const coords = proj4(
          "EPSG:3857",
          "EPSG:4326",
          row.pos.map((str: string) => parseFloat(str))
        );

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coords,
          },
          properties: { this: "that" },
        };
      }
    });
    /*const feat = features?.filter((f: any) => {
      if (f) {
        f.geometry.coordinates[0] > -180 && f.geometry.coordinates[0] < 180;
      } else {
        return false;
      }
    });*/
    return { type: "FeatureCollection", features: features };
  });
}

async function CsvToArray(url: string, delimiter: string) {
  return fetch(url)
    .then((response) => {
      if (response.ok) return response.text();
      else return Promise.reject("Error " + response.status);
    })
    .then((result) => {
      return readCoordinates(result, delimiter);
    })
    .catch((error) => {
      console.log(error);
    });
}

function parseCsvToRowsAndColumn(csvText: string, csvColumnDelimiter = "\t") {
  const rows = csvText.split("\n");
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map((row) => row.split(csvColumnDelimiter));
}

function stripQuotes(string: string) {
  return string && string.startsWith('"') && string.endsWith('"')
    ? string.slice(1, -1)
    : string;
}

function readCoordinates(data: any, delimiter: string) {
  const rowsWithColumns = parseCsvToRowsAndColumn(data, delimiter);
  const headerRow = rowsWithColumns.splice(0, 1)[0];

  const latRegEx = new RegExp("lat(itude)?", "i");
  const latColumn = headerRow.findIndex((h) => latRegEx.test(h));

  const lonRegEx = new RegExp("lon(gitude)?", "i");
  const lonColumn = headerRow.findIndex((h) => lonRegEx.test(h));

  if (latColumn === -1 || lonColumn === -1) {
    console.log(
      "Both latitude and longitude columns must be present to display on a map."
    );
    return null;
  }

  return rowsWithColumns.map((row) => ({
    pos: [row[latColumn], row[lonColumn]],
    popup: (
      <>
        {headerRow.map(
          (header, i) =>
            header && (
              <div key={header}>
                {stripQuotes(header)}: {stripQuotes(row[i])}
              </div>
            )
        )}
      </>
    ),
  }));
}
