import csvRaw from "./raw/affine_cloud_public_snapshots.csv?raw";

const headers = [
  "guid",
  "workspaceId",
  "hexString",
  "created",
  "updated",
] as const;

type Row = {
  [key in (typeof headers)[number]]: string;
} & {
  binary: Uint8Array;
};

function parseCSV(csv: string) {
  const rows = csv.split("\n");
  const data = rows
    .filter((r) => !!r)
    .map((row) => {
      const values = row.split(",");
      const rowObject: Row = {} as Row;
      headers.forEach((header, index) => {
        rowObject[header] = values[index];
        if (header === "hexString") {
          rowObject.binary = binaryStringToBuffer(values[index]);
        }
      });
      return rowObject;
    });
  return data;
}

function binaryStringToBuffer(hexString: string) {
  hexString = hexString.slice(2); // first 2 chars are "0x"
  if (hexString.length % 2 !== 0) {
    throw new Error(
      "Invalid hexString length. The length must be a multiple of 2."
    );
  }

  const bytes = new Uint8Array(hexString.length / 2);

  for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
    bytes[j] = parseInt(hexString.substr(i, 2), 16);
  }

  return bytes;
}

const data = parseCSV(csvRaw);

const map = new Map<string, Row>();

data.forEach((row) => {
  map.set(row.guid, row);
});

declare global {
  interface Window {
    data: Row[];
    map: Map<string, Row>;
    root: Row;
  }
}

const root = data.find((d) => d.guid === d.workspaceId)!;

console.log(data, map, root);

window.data = data;
window.map = map;
window.root = root;

export { data, map, root };
