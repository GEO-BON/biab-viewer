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
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  GetStac,
  GetStacSearch,
  GetCOGBounds,
  GetCountryList,
  GetStateList,
  GetCountryGeojson,
  GetStateGeojson,
} from "../../helpers/api";
import { Item } from "./styles";
import _ from "underscore";
import {
  CustomSelect,
  CustomMenuItem,
  CustomButton,
  CustomButtonGreen,
  CustomAutocomplete,
} from "../CustomMUI";
import { PipelineOutput } from "./PipelineOutput";

import {
  defaultYearList,
  monthList,
  timeSeriesCollections,
  chelsaVariableList,
  mammalsScenariosList,
  mammalsYearsList,
} from "./variables";
import type { FeatureCollection } from "geojson";
import L from "leaflet";
import Draw from "leaflet-draw";

export default function Sidebar(props: any) {
  const {
    t = (text: string) => text,
    setSelectedLayerURL,
    setSelectedLayerAssetName,
    setColormap,
    setColormapList,
    setSelectedCountry,
    selectedCountry,
    setSelectedState,
    selectedState,
    pipelineData,
    setPipelineRunId,
    geojson,
    showStatsButton,
    isTimeSeriesCollection,
    generateTimeSeries,
    generateStats,
    handleAddLocationChange,
    qualcmaps,
    quantcmaps,
    colormap,
    logIt,
    setIsTimeSeriesCollection,
    setTimeSeriesLayers,
    map,
  } = props;

  interface Params {
    pipeline_run_id: string;
  }
  const emptyFC: FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  const navigate = useNavigate();
  const { pipeline_run_id } = useParams<keyof Params>() as Params;
  const containerRef = useRef<HTMLInputElement>(null);
  const [pips, setPips] = useState([]);
  const { pathname } = useLocation();
  const [outputType, setOutputType] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");

  useEffect(() => {
    setPipelineRunId(pipeline_run_id);
  }, [pipeline_run_id]);

  useEffect(() => {
    if (pathname === "/") {
      navigate("/SDM>SDM_maxEnt>f5659e19be98b162509ba0f5e35e1326");
    }
  }, [pathname]);

  const displayOutput = (output: string, type: string) => {
    if (type.includes("geotiff")) {
      setSelectedLayerURL(output);
    }
  };

  useEffect(() => {
    const pips: any = [];
    if (Object.keys(pipelineData).length > 0) {
      _.mapObject(pipelineData, (pd: any) => {
        pips.push(
          <PipelineOutput
            key={pd.label}
            outputObj={pd}
            displayOutput={displayOutput}
            setOutputType={setOutputType}
            outputType={outputType}
            selectedOutput={selectedOutput}
            setSelectedOutput={setSelectedOutput}
          />
        );
      });
      setPips(pips);
    }
  }, [pipelineData]);

  const drawPolygon = () => {
    const el = document.getElementsByClassName("leaflet-draw-draw-polygon");
    if (el[0] instanceof HTMLElement) {
      el[0].click();
    }
  };
  const drawRectangle = () => {
    const el = document.getElementsByClassName("leaflet-draw-draw-rectangle");
    if (el[0] instanceof HTMLElement) {
      el[0].click();
    }
  };

  useEffect(() => {
    const handleScroll = (e: any) => {
      e.stopPropagation();
      console.log("Stop");
    };

    containerRef.current?.addEventListener("scroll", handleScroll);
    containerRef.current?.addEventListener("wheel", handleScroll);
    containerRef.current?.addEventListener("drag", handleScroll);
    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
      containerRef.current?.removeEventListener("wheel", handleScroll);
      containerRef.current?.removeEventListener("drag", handleScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        width: "30vw",
        background: "#333",
        zIndex: 999,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        border: "2px solid #444",
        overflowY: "scroll",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          background: "#222",
          width: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#444",
          borderRadius: "3px",
        },
      }}
      draggable
      ref={containerRef}
    >
      <Grid sx={{ marginLeft: "15px" }}>
        <Stack
          spacing={{ xs: 1, sm: 1, md: 2 }}
          sx={{ width: "100%", background: "none", border: "0px" }}
        >
          <Item sx={{ background: "none", border: "0px" }}>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Grid item sm={2}>
                <img src="/logo.png" style={{ width: "100%" }} />
              </Grid>
              <Grid item sm={10}>
                <Typography variant="h5" color="primary.light">
                  Results Viewer
                </Typography>
              </Grid>
            </Grid>
            <Box>
              <Typography color="primary.contrastText">
                Explore results from a Bon-in-a-Box analysis pipeline
              </Typography>
            </Box>
            <Box>{pips}</Box>
          </Item>
        </Stack>
      </Grid>
    </Box>
  );
}
