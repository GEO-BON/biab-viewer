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

  const handleSelect = (value: string) => {
    setSelectedOutput(value);
  };
  const handleClick = (event: any, out: string, ot: string) => {
    event.stopPropagation();
    event.preventDefault();
    displayOutput(out, ot);
  };

  useEffect(() => {
    setOutputType(outputObj.type);
    if (Array.isArray(outputObj.outputs)) {
      setSelectedOutput(outputObj.outputs[0]);
      const mitems: any = [];
      _.mapObject(outputObj.outputs, (o: any) => {
        mitems.push(
          <CustomMenuItem key={`it-${o}`} value={o}>
            {o}
          </CustomMenuItem>
        );
      });
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
            id="demo-simple-select-standard"
            value={selectedOutput}
            onChange={(event: any) => handleSelect(event.target.value)}
            label="Layer"
          >
            {mitems}
          </CustomSelect>
          <CustomButtonGreen
            onClick={(event: any) =>
              handleClick(event, outputObj.outputs, outputObj.type)
            }
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
      {forms}
    </Item>
  );
}
