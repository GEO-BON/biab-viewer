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
} from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  GetStac,
  GetStacSearch,
  GetCOGBounds,
  GetCountryList,
  GetStateList,
  GetCountryGeojson,
  GetStateGeojson,
} from '../../helpers/api';
import { Item } from './styles';
import _ from 'underscore';
import {
  CustomSelect,
  CustomMenuItem,
  CustomButton,
  CustomButtonGreen,
  CustomAutocomplete,
} from '../CustomMUI';
import PentagonIcon from '@mui/icons-material/Pentagon';
import RectangleIcon from '@mui/icons-material/Rectangle';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';

import {
  defaultYearList,
  monthList,
  timeSeriesCollections,
  chelsaVariableList,
  mammalsScenariosList,
  mammalsYearsList,
} from './variables';
import type { FeatureCollection } from 'geojson';
import L from 'leaflet';
import Draw from 'leaflet-draw';

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
    collection: string;
    item: string;
  }
  const emptyFC: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  const navigate = useNavigate();
  const { collection, item } = useParams<keyof Params>() as Params;
  const [selectedCollection, setSelectedCollection] = useState('Choose...');
  const [selectedLayer, setSelectedLayer] = useState('');
  const [level1List, setLevel1List] = useState([{ option: '', value: '' }]);
  const [selectedLevel1, setSelectedLevel1] = useState('1');
  const [level1Title, setLevel1Title] = useState('');
  const [showLevel1, setShowLevel1] = useState(false);
  const [level2List, setLevel2List] = useState([{ option: '', value: '' }]);
  const [selectedLevel2, setSelectedLevel2] = useState('1');
  const [level2Title, setLevel2Title] = useState('');
  const [showLevel2, setShowLevel2] = useState(false);
  const [level3List, setLevel3List] = useState([{ option: '', value: '' }]);
  const [selectedLevel3, setSelectedLevel3] = useState('1');
  const [level3Title, setLevel3Title] = useState('');
  const [showLevel3, setShowLevel3] = useState(false);
  const [collectionList, setCollectionList] = useState([
    { option: '', value: '' },
  ]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [layerItems, setLayerItems] = useState([]);
  const containerRef = useRef<HTMLInputElement>(null);

  const handleCollectionChange = async (e: any) => {
    setSelectedCollection(e);
    setTimeSeriesLayers([]);
    if (e === 'chelsa-monthly') {
      setShowLevel1(true);
      setShowLevel2(true);
      setShowLevel3(true);
      //Route set the item
      setLevel1List(chelsaVariableList);
      setLevel2List(defaultYearList);
      setLevel3List(monthList);
      setLevel1Title('Variable');
      setLevel2Title('Year');
      setLevel3Title('Month');
    } else if (e === 'global-mammals') {
      setShowLevel1(true);
      setShowLevel2(true);
      setShowLevel3(true);
      setLevel2List(mammalsScenariosList);
      setLevel3List(mammalsYearsList);
      setShowLevel1(true);
      setLevel1Title('Species');
      setShowLevel2(true);
      setLevel2Title('Scenario');
      setShowLevel3(true);
      setLevel3Title('Year');
      GetStacSearch({
        query: {
          scenario: { eq: 'SSP5-RCP8.5' },
        },
        datetime: '2015-01-01T00:00:00Z',
        limit: 500,
        offset: 500,
      }).then((res: any) => {
        const items: any = res.data.features.map((c: any) => ({
          option: c.properties.species.replace('_', ' '),
          value: c.properties.species,
        }));
        setLevel1List(items);
      });
    } else {
      setShowLevel2(false);
      setShowLevel3(false);
      setShowLevel1(true);
      setLevel1Title('Variable');
      const timeSeriesLayers: any = [];
      GetStac(`/collections/${e}/items`, { limit: 200 }).then((res: any) => {
        let items: any = '';

        if (res.data) {
          items = res.data.features.map((c: any) => {
            let option = c.properties.description;
            if (
              c.collection === 'esacci-lc' ||
              c.collection === 'fragmentation-rmf'
            ) {
              option = c.properties.year;
            } else if (c.collection === 'chelsa-clim-proj') {
              option = `${c.properties.variable}-${c.properties.rcp}-${c.properties.model}`;
            } else if (c.collection === 'soilgrids') {
              option = `${c.properties.variable}-${c.properties.depth}`;
            }
            if (c.collection === 'fragmentation-rmf') {
              timeSeriesLayers.push({
                ref: c.properties.year.toString(),
                url: c.assets.data.href,
              });
            }
            return {
              option: option,
              value: c.id,
            };
          });
        }
        setTimeSeriesLayers(timeSeriesLayers);
        setLevel1List(items);
      });
    }
  };
  const handleLayerChange = (e: any) => {
    setSelectedLevel1(e);
    if (e) {
      if (e === 'All years') {
        setSelectedLayerURL('');
        setSelectedLayerAssetName('');
      } else {
        let val = '';
        if (selectedCollection === 'chelsa-monthly') {
          let month = '';
          if (parseInt(selectedLevel3) < 10) {
            month = `0${parseInt(selectedLevel3)}`;
          } else {
            month = selectedLevel3;
          }
          val = `${e}_${month}_${selectedLevel2}`;
        } else if (selectedCollection === 'global-mammals') {
          val = `${selectedLevel1}_${selectedLevel2}_${selectedLevel3}`;
        } else {
          val = e;
        }
        if (val.indexOf('-lc') !== -1 || val.indexOf('cobertura') !== -1) {
          setColormap('tab10');
          setColormapList(qualcmaps);
        } else if (qualcmaps.includes(colormap)) {
          setColormap('inferno');
          setColormapList(quantcmaps);
        }

        GetStac(`/collections/${selectedCollection}/items/${val}`, {}).then(
          (res: any) => {
            if (res.data) {
              setSelectedLayerURL(
                res.data.assets[Object.keys(res.data.assets)[0]].href
              );
              setSelectedLayerAssetName(Object.keys(res.data.assets)[0]);
              //navigate(`/${selectedCollection}/${val}`);
            }
          }
        );
      }
    }
  };

  useEffect(() => {
    GetStac('/collections', {}).then((res: any) => {
      const items: any = res.data.collections.map((c: any) => ({
        option: c.title,
        value: c.id,
      }));
      setCollectionList(items);
    });
  }, []);

  useEffect(() => {
    GetCountryList().then(cl => {
      setCountryList(cl.data);
    });
  }, []);

  useEffect(() => {
    if (collection) {
      handleCollectionChange({ value: collection }).then(() => {
        if (item) {
          if (collection === 'global-mammals') {
            const tt: any = item.split('_');
            setSelectedLevel1(`${tt[0]}_${tt[1]}`);
            setSelectedLevel2(tt[2]);
            setSelectedLevel3(tt[3]);
          } else if (collection === 'chelsa-monthly') {
            const tt: any = item.split('_');
            setSelectedLevel1(tt[0]);
            let month = '1';
            if (parseInt(tt[2]) < 10) {
              month = `0${parseInt(tt[2])}`;
            } else {
              month = tt[2];
            }
            setSelectedLevel2(month);
            setSelectedLevel3(tt[1]);
          } else {
            setSelectedLevel1(item);
          }
          setSelectedLayer(item);
        }
      });
    }
  }, [collection, item]);

  const handleCountryChange = (value: any, reason: any) => {
    if (reason === 'clear') {
      //setActiveSearch(false);
    }
    if (value) {
      //setShowStatsButton(true);
      GetStateList(value).then(sl => {
        setStateList(sl.data);
      });
    }
    setSelectedState('');
    setSelectedCountry(value);
  };

  const handleStateChange = (value: any, reason: any) => {
    if (reason === 'clear') {
      //setActiveSearch(false);
    }
    if (value) {
      //setShowStatsButton(true);
    }
    setSelectedState(value);
  };

  useEffect(() => {
    const lItems: any = [
      <CustomMenuItem key={'choose-item'} value={'All years'}>
        All years
      </CustomMenuItem>,
    ];
    if (level1List.length > 0) {
      level1List.map((ll: any) => {
        lItems.push(
          <CustomMenuItem key={`it-${ll.value}`} value={ll.value}>
            {ll.option}
          </CustomMenuItem>
        );
      });
    }
    setLayerItems(lItems);
    setSelectedLevel1('All years');
  }, [level1List]);

  const drawPolygon = () => {
    const el = document.getElementsByClassName('leaflet-draw-draw-polygon');
    if (el[0] instanceof HTMLElement) {
      el[0].click();
    }
  };
  const drawRectangle = () => {
    const el = document.getElementsByClassName('leaflet-draw-draw-rectangle');
    if (el[0] instanceof HTMLElement) {
      el[0].click();
    }
  };

  useEffect(() => {
    const handleScroll = (e: any) => {
      e.stopPropagation();
      console.log('Stop');
    };

    containerRef.current?.addEventListener('scroll', handleScroll);
    containerRef.current?.addEventListener('wheel', handleScroll);
    containerRef.current?.addEventListener('drag', handleScroll);
    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
      containerRef.current?.removeEventListener('wheel', handleScroll);
      containerRef.current?.removeEventListener('drag', handleScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        width: '30vw',
        background: '#333',
        zIndex: 999,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        border: '2px solid #444',
        overflowY: 'scroll',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          background: '#222',
          width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#444',
          borderRadius: '3px',
        },
      }}
      draggable
      ref={containerRef}
    >
      <Grid sx={{ marginLeft: '15px' }}>
        <Stack
          spacing={{ xs: 1, sm: 1, md: 2 }}
          sx={{ width: '100%', background: 'none', border: '0px' }}
        >
          <Item sx={{ background: 'none', border: '0px' }}>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Grid item sm={2}>
                <img src="/viewer/logo.png" style={{ width: '100%' }} />
              </Grid>
              <Grid item sm={10}>
                <Typography variant="h4" color="primary.light">
                  KABOOM !
                </Typography>
              </Grid>
            </Grid>
            <Box>
              <Typography color="primary.contrastText">
                Knowledge Assessment for Biodiversity Observations and
                Objectives Monitoring
              </Typography>
            </Box>
          </Item>
          <Item sx={{ background: 'none', border: '0px' }}>
            <Typography color="primary.light">
              Step 1 - Choose Essential Biodiversity Variable
            </Typography>
            <FormControl
              variant="standard"
              sx={{
                m: 2,
                minWidth: 200,
                width: '80%',
              }}
            >
              <InputLabel id="collection-label">
                <Typography color="primary.light">
                  Essential Biodiversity Variable
                </Typography>
              </InputLabel>
              <CustomSelect
                autoFocus
                id="demo-simple-select-standard"
                value={selectedCollection}
                onChange={event => handleCollectionChange(event.target.value)}
                label="Essential Biodiversity Variable"
              >
                <CustomMenuItem value={'Choose...'}>Choose...</CustomMenuItem>
                <CustomMenuItem value={'fragmentation-rmf'}>
                  Global Fragmentation of Forests
                </CustomMenuItem>
              </CustomSelect>
            </FormControl>
            {level1List.length > 1 && (
              <>
                <Typography color="primary.light">
                  Optionally choose year
                </Typography>
                <FormControl
                  variant="standard"
                  sx={{
                    m: 1,
                    minWidth: 200,
                    width: '80%',
                  }}
                >
                  <InputLabel id="collection-label">
                    <Typography color="primary.light">Year</Typography>
                  </InputLabel>
                  <CustomSelect
                    id="demo-simple-select-standard"
                    value={selectedLevel1}
                    onChange={event => handleLayerChange(event.target.value)}
                    label="Year"
                  >
                    {layerItems}
                  </CustomSelect>
                </FormControl>
              </>
            )}
          </Item>
          {selectedCollection !== 'Choose...' && (
            <Item sx={{ background: 'none', border: '0px' }}>
              <Typography color="primary.light">
                Step 2 - Choose extent
              </Typography>
              <FormControl
                variant="standard"
                sx={{
                  m: 2,
                  minWidth: 200,
                  width: '80%',
                }}
              >
                <Grid container spacing={2} sx={{ marginBottom: '15px' }}>
                  <Grid item sm={3}>
                    <CustomButton onClick={() => drawPolygon()}>
                      <PentagonIcon />
                    </CustomButton>
                  </Grid>
                  <Grid item sm={3}>
                    <CustomButton>
                      <RectangleIcon onClick={() => drawRectangle()} />
                    </CustomButton>
                  </Grid>
                </Grid>
                <Typography color={'primary.contrastText'}>
                  or select Country and optionally state/province
                </Typography>
                <Grid container spacing={2} sx={{ marginTop: '7px' }}>
                  <Grid item>
                    <CustomAutocomplete
                      id="country-select"
                      autoComplete
                      includeInputInList
                      options={countryList}
                      sx={{ width: 300 }}
                      onChange={(event: any, newValue: any, reason: any) => {
                        handleCountryChange(newValue, reason);
                      }}
                      size="medium"
                      renderInput={params => (
                        <TextField {...params} label="Country" error />
                      )}
                    />
                  </Grid>
                  <Grid item>
                    <CustomAutocomplete
                      color="primary"
                      id="state-select"
                      autoComplete
                      includeInputInList
                      options={stateList}
                      sx={{ width: 300, margin: '2px 2px 2px 0px' }}
                      onChange={(event: any, newValue: any, reason: any) => {
                        handleStateChange(newValue, reason);
                      }}
                      size="medium"
                      renderInput={params => (
                        <TextField {...params} label="State/Province" error />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid md={8}>
                  <CustomButtonGreen onClick={handleAddLocationChange}>
                    Add Selected Location
                  </CustomButtonGreen>
                </Grid>
                <Typography
                  sx={{ fontSize: '0.8rem', marginTop: '5px' }}
                  color={'primary.contrastText'}
                >
                  Add multiple areas to compare them
                </Typography>
              </FormControl>
            </Item>
          )}
          {showStatsButton &&
            isTimeSeriesCollection &&
            geojson.features.length > 0 && (
              <Item sx={{ background: 'none', border: '0px' }}>
                <Typography color="primary.light">
                  Step 3 - Generate graph
                </Typography>
                {selectedLevel1 === 'All years' && (
                  <CustomButton
                    sx={{
                      padding: '3px 3px 3px 3px',
                      width: '50px',
                      height: '50px',
                      margin: '15px',
                    }}
                    onClick={generateTimeSeries}
                  >
                    <InsightsIcon />
                  </CustomButton>
                )}
                {selectedLevel1 !== 'All years' && (
                  <CustomButton
                    sx={{
                      padding: '3px 3px 3px 3px',
                      width: '50px',
                      height: '50px',
                      margin: '15px',
                    }}
                    onClick={() => generateStats()}
                  >
                    <BarChartIcon />
                  </CustomButton>
                )}
              </Item>
            )}
        </Stack>
      </Grid>
    </Box>
  );
}
