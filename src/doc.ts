import * as Y from "yjs";

import { Schema, Workspace } from "@blocksuite/store";
import { __unstableSchemas, AffineSchemas } from "@blocksuite/blocks/models";

import { data, root } from "./parse";

const globalBlockSuiteSchema = new Schema();
globalBlockSuiteSchema.register(AffineSchemas).register(__unstableSchemas);

const workspace = new Workspace({
  schema: globalBlockSuiteSchema,
  id: root.guid,
});

// assume doc is already upgraded
Y.applyUpdate(workspace.doc, root.binary);

// we will iterate over the map and add each row to the workspace

// we guess the block version is the following:
const blocksVersions = {
  "affine:note": 1,
  "affine:bookmark": 1,
  "affine:database": 2,
  "affine:divider": 1,
  "affine:image": 1,
  "affine:list": 1,
  "affine:code": 1,
  "affine:page": 2,
  "affine:paragraph": 1,
  "affine:surface": 3,
};

const subdocs = data
  .filter((d) => {
    return d.guid !== d.workspaceId;
  })
  .map((row) => {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, row.binary);
    doc.getMap("blocks"); // init blocks field, otherwise it will be {}
    return [row.guid, doc] as const;
  });

for (const [guid, doc] of subdocs) {
  try {
    globalBlockSuiteSchema.upgradePage(0, blocksVersions, doc);
  } catch (err) {
    console.error(`Failed to upgrade page ${guid}`, err);
  }
  // print paragraph content
  const blocks = doc.getMap("blocks");
  Object.values(blocks.toJSON()).forEach((block) => {
    console.log(block)
    if (block['sys:flavour'] === "affine:paragraph") {
      console.log(block);
    }
  });
}
