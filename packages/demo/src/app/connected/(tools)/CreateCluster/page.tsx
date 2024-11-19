"use client";

import React, { useEffect, useState } from "react";
import { TextInput } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useGetExplorerLink } from "@/src/utils";
import { useApp } from "@/src/context";
import { ButtonsPanel } from "@/src/components/ButtonsPanel";
import { ccc, spore } from "@ckb-ccc/connector-react";
import { Textarea } from "@/src/components/Textarea";

function generateClusterDescriptionUnderDobProtocol(
  client: ccc.Client,
): string {
  /**
   * Generation example for DOB0
   */
  const clusterDescription = "My First DOB Cluster";
  const dob0Pattern: spore.dob.PatternElementDob0[] = [
    {
      traitName: "BackgroundColor",
      dobType: "String",
      dnaOffset: 0,
      dnaLength: 1,
      patternType: "options",
      traitArgs: ["red", "blue", "green", "black", "white"],
    },
    {
      traitName: "FontSize",
      dobType: "Number",
      dnaOffset: 1,
      dnaLength: 1,
      patternType: "range",
      traitArgs: [10, 50],
    },
    {
      traitName: "FontFamily",
      dobType: "String",
      dnaOffset: 2,
      dnaLength: 1,
      patternType: "options",
      traitArgs: ["Arial", "Helvetica", "Times New Roman", "Courier New"],
    },
    {
      traitName: "Timestamp",
      dobType: "Number",
      dnaOffset: 3,
      dnaLength: 4,
      patternType: "rawNumber",
    },
    {
      traitName: "ConsoleLog",
      dobType: "String",
      dnaOffset: 7,
      dnaLength: 13,
      patternType: "utf8",
    },
  ];

  /**
   * Generation example for DOB1
   */
  const dob1Pattern: spore.dob.PatternElementDob1[] = [
    {
      imageName: "IMAGE.0",
      svgFields: "attributes",
      traitName: "",
      patternType: "raw",
      traitArgs: "xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'",
    },
    {
      imageName: "IMAGE.0",
      svgFields: "elements",
      traitName: "Timestamp",
      patternType: "options",
      traitArgs: [
        [
          [0, 1000000],
          "<image width='300' height='200' href='btcfs://b2f4560f17679d3e3fca66209ac425c660d28a252ef72444c3325c6eb0364393i0' />",
        ],
        [
          ["*"],
          "<image width='300' height='200' btcfs://eb3910b3e32a5ed9460bd0d75168c01ba1b8f00cc0faf83e4d8b67b48ea79676i0 />",
        ],
      ],
    },
    {
      imageName: "IMAGE.0",
      svgFields: "elements",
      traitName: "BackgroundColor",
      patternType: "options",
      traitArgs: [
        ["red", "<rect width='20' height='20' x='5' y='5' fill='red' />"],
        ["blud", "<rect width='20' height='20' x='20' y='5' fill='blue' />"],
        ["green", "<rect width='20' height='20' x='5' y='20' fill='green' />"],
        [["*"], "<rect width='20' height='20' x='20' y='20' fill='pink' />"],
      ],
    },
    {
      imageName: "IMAGE.0",
      svgFields: "elements",
      traitName: "ConsoleLog",
      patternType: "options",
      traitArgs: [
        [
          "hello, world!",
          "<image width='100' height='100' href='ipfs://QmeQ6TfqzsjJCMtYmpbyZeMxiSzQGc6Aqg6NyJTeLYrrJr' />",
        ],
        [
          ["*"],
          "<image width='100' height='100' href='ipfs://QmYiiN8EXxAnyddatCbXRYzwU9wwAjh21ms4KEJodxg8Fo' />",
        ],
      ],
    },
  ];
  const dob1: spore.dob.Dob1 = {
    description: clusterDescription,
    dob: {
      ver: 1,
      decoders: [
        {
          decoder: spore.dob.getDecoder(client, "dob0"),
          pattern: dob0Pattern,
        },
        {
          decoder: spore.dob.getDecoder(client, "dob1"),
          pattern: dob1Pattern,
        },
      ],
    },
  };
  return spore.dob.encodeClusterDescriptionForDob1(dob1);
}
export default function CreateCluster() {
  const { signer, createSender } = useApp();
  const { client } = ccc.useCcc();
  const { log } = createSender("Create Cluster");

  const { explorerTransaction } = useGetExplorerLink();

  const [name, SetName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setDescription(
      JSON.stringify(
        JSON.parse(generateClusterDescriptionUnderDobProtocol(client)),
        undefined,
        2,
      ),
    );
  }, [client]);

  return (
    <div className="flex w-full flex-col items-stretch">
      <TextInput
        label="Name"
        placeholder="Cluster Name"
        state={[name, SetName]}
      />
      <Textarea
        label="Description"
        placeholder="Cluster Description"
        rows={10}
        state={[description, setDescription]}
      />

      <ButtonsPanel>
        <Button
          onClick={async () => {
            if (!signer) return;
            const { tx, id } = await spore.createSporeCluster({
              signer,

              data: {
                name,
                description: JSON.stringify(JSON.parse(description)),
              },
            });
            await tx.completeFeeBy(signer);

            const txHash = await signer.sendTransaction(tx);
            log(
              "Transaction sent:",
              explorerTransaction(txHash),
              "Cluster ID:",
              id,
            );
            await signer.client.waitTransaction(txHash);
            log("Transaction committed:", explorerTransaction(txHash));
          }}
        >
          Create Cluster
        </Button>
      </ButtonsPanel>
    </div>
  );
}
