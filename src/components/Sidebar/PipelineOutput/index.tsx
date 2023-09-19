import React, { useState, useEffect } from "react";
import {
  CustomSelect,
  CustomMenuItem,
  CustomButton,
  CustomButtonGreen,
  CustomAutocomplete,
} from "../../CustomMUI";
import {
  TextField,
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  InputBase,
  InputLabel,
  FormControl,
  Button,
  Tooltip,
} from "@mui/material";
import { Item } from "../styles";
import _ from "underscore";

export function PipelineOutput(props: any) {
  const {
    outputObj,
    displayOutput,
    setSelectedOutput,
    setOutputType,
    selectedOutput,
    outputType,
  } = props;
  const [forms, setForms] = useState(<></>);
  const [selectedItem, setSelectedItem] = useState(
    outputObj.outputs.split(",")[0]
  );

  const outs = outputObj.outputs.split(",");

  const handleSelect = (value: string) => {
    setSelectedOutput(value);
    setSelectedItem(value);
  };

  const handleClick = (event: any, out: string, ot: string) => {
    event.stopPropagation();
    event.preventDefault();
    if (out !== "") {
      displayOutput(out, ot);
    } else {
      displayOutput(selectedItem, ot);
    }
  };

  useEffect(() => {
    if (outputObj.type.includes("[]")) {
      const outs = outputObj.outputs.split(",");
      //setSelectedItem(outs[0]);
      const form = (
        <FormControl
          variant="standard"
          sx={{
            m: 1,
            minWidth: 200,
            width: "80%",
          }}
        >
          <InputLabel id="collection-label">
            <Typography color="primary.light">Choose layer</Typography>
          </InputLabel>
          <CustomSelect
            id="simple-select-standard"
            value={selectedItem}
            onChange={(event: any) => handleSelect(event.target.value)}
            label="Layer"
          >
            {outs.map((o: any) => (
              <CustomMenuItem key={`it-${o}`} value={o}>
                {o.split("/").pop()}
              </CustomMenuItem>
            ))}
          </CustomSelect>
          <CustomButtonGreen
            key={`but-${outputObj.outputs}`}
            onClick={(event: any) => handleClick(event, "", outputObj.type)}
          >
            Add to map
          </CustomButtonGreen>
        </FormControl>
      );
      setForms(form);
    } else {
      setSelectedOutput(outputObj.outputs);
      setForms(
        <CustomButtonGreen
          key={`but-${outputObj.outputs}`}
          onClick={(event: any) => {
            handleClick(event, outputObj.outputs, outputObj.type);
          }}
        >
          Add to map
        </CustomButtonGreen>
      );
    }
  }, [outputObj]);

  return (
    <Item sx={{ background: "none", border: "0px" }}>
      <Typography color="primary.light" sx={{ fontWeight: 600 }}>
        {`${outputObj.label[0].toUpperCase()}${outputObj.label.slice(1)}`}
      </Typography>
      <Typography color="primary.light" fontSize={11}>
        {`${outputObj.description[0].toUpperCase()}${outputObj.description.slice(
          1
        )}`}
      </Typography>
      {outputObj.type.includes("[]") && (
        <FormControl
          variant="standard"
          sx={{
            m: 1,
            minWidth: 200,
            width: "80%",
          }}
        >
          <InputLabel id="collection-label">
            <Typography color="primary.light">Choose layer</Typography>
          </InputLabel>
          <CustomSelect
            id="simple-select-standard"
            value={selectedItem}
            onChange={(event: any) => handleSelect(event.target.value)}
            label="Layer"
          >
            {outs.map((o: any) => (
              <CustomMenuItem key={`it-${o}`} value={o}>
                {o.split("/").pop()}
              </CustomMenuItem>
            ))}
          </CustomSelect>
          <CustomButtonGreen
            key={`but-${outputObj.outputs}`}
            onClick={(event: any) => handleClick(event, "", outputObj.type)}
          >
            Add to map
          </CustomButtonGreen>
        </FormControl>
      )}
      {!outputObj.type.includes("[]") && (
        <CustomButtonGreen
          key={`but-${outputObj.outputs}`}
          onClick={(event: any) => {
            handleClick(event, outputObj.outputs, outputObj.type);
          }}
        >
          Add to map
        </CustomButtonGreen>
      )}
    </Item>
  );
}
