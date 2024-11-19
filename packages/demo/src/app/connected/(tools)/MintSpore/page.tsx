"use client";

import React, { useCallback, useEffect, useState } from "react";
import { TextInput } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useGetExplorerLink } from "@/src/utils";
import { useApp } from "@/src/context";
import { ButtonsPanel } from "@/src/components/ButtonsPanel";
import { Dropdown } from "@/src/components/Dropdown";
import { ccc, spore } from "@ckb-ccc/connector-react";

export default function MintSpore() {
  const { signer, createSender } = useApp();
  const { log } = createSender("Mint Spore");
  const { explorerTransaction } = useGetExplorerLink();
  const [dna, setDna] = useState<string>("");
  const [clusterId, setClusterId] = useState<string>("");
  const [clusterList, setClusterList] = useState([
    {
      id: "",
      name: "Mint Without Cluster",
    },
  ]);

  const mintSpore = useCallback(async () => {
    if (!signer) return;

    const content = `{"dna":"${ccc.hexFrom(dna).slice(2)}"}`;
    // Build transaction
    const { tx, id } = await spore.createSpore({
      signer,
      data: {
        contentType: "dob/1",
        content: ccc.bytesFrom(content, "utf8"),
        clusterId: clusterId === "" ? undefined : clusterId,
      },
      clusterMode: clusterId === "" ? "skip" : "clusterCell",
    });
    await tx.completeFeeBy(signer);

    const txHash = await signer.sendTransaction(tx);
    log("Transaction sent:", explorerTransaction(txHash), "Spore ID:", id);
    await signer.client.waitTransaction(txHash);
    log("Transaction committed:", explorerTransaction(txHash));
  }, [signer, log, clusterId, dna, explorerTransaction]);

  useEffect(() => {
    if (!signer) {
      return;
    }

    (async () => {
      const list = [
        {
          id: "",
          name: "Mint Without Cluster",
        },
      ];

      for await (const {
        cluster,
        clusterData,
      } of spore.findSporeClustersBySigner({
        signer,
        order: "desc",
      })) {
        if (!cluster.cellOutput.type?.args) {
          continue;
        }

        list.push({
          id: cluster.cellOutput.type.args,
          name: clusterData.name,
        });
      }

      setClusterList(list);
    })();
  }, [signer]);

  return (
    <div className="flex w-full flex-col items-stretch">
      <TextInput label="DNA" placeholder="Spore DNA" state={[dna, setDna]} />

      <label className="mt-4 text-sm">Select a Cluster (optional)</label>
      <Dropdown
        className="mt-2"
        options={clusterList.map((cluster) => ({
          name: cluster.id,
          displayName: cluster.name,
          iconName: "Wheat",
        }))}
        selected={clusterId}
        onSelect={setClusterId}
      />
      <ButtonsPanel>
        <Button onClick={mintSpore}>Mint Spore</Button>
      </ButtonsPanel>
    </div>
  );
}
