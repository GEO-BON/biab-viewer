import axios from "axios";
import _ from "underscore";

export const GetPipelineOutputs = async (pipeline_id: string) => {
  let result: any = { data: { outputs: [] } };
  const base_url = import.meta.env.VITE_BIAB_HOST;
  try {
    result = await axios({
      method: "get",
      baseURL: `${base_url}/pipeline/${pipeline_id}.json/info`,
    });
  } catch (error) {
    result = { data: {} };
  }
  return result.data.outputs;
};

export const GetPipelineRunOutputs = async (pipeline_run_id: string) => {
  let result: any = { data: {} };
  const base_url = import.meta.env.VITE_BIAB_HOST;
  try {
    result = await axios({
      method: "get",
      baseURL: `${base_url}/pipeline/${pipeline_run_id}/outputs`,
    });
  } catch (error) {
    result = { data: {} };
  }
  return result.data;
};

export const GetScriptDescription = async (script_id: string) => {
  let result: any = { data: {} };
  const base_url = import.meta.env.VITE_BIAB_HOST;
  try {
    result = await axios({
      method: "get",
      baseURL: `${base_url}/script/${script_id}.yml/info`,
    });
  } catch (error) {
    result = { data: {} };
  }
  return result.data;
};

export const GetScriptOutputs = async (script_run_output_path: string) => {
  let result = { data: {} };
  const base_url = import.meta.env.VITE_BIAB_HOST;
  try {
    result = await axios({
      method: "get",
      baseURL: `${base_url}/output/${script_run_output_path}/output.json`,
    });
  } catch (error) {
    result = { data: {} };
  }
  return result.data;
};

export const createPipeline4Display = async (pipeline_run_id: string) => {
  const pipeline_id = pipeline_run_id.split(">").slice(0, -1).join(">");
  const base_url = import.meta.env.VITE_BIAB_HOST;

  return GetPipelineOutputs(pipeline_id).then((po: any) => {
    return GetPipelineRunOutputs(pipeline_run_id).then((pro: any) => {
      return Promise.allSettled(
        Object.keys(po).map(async (p: any) => {
          const script = p.split("|")[0];
          const output = p.split("|")[1];
          const script_run_output_path = pro[script];
          return await GetScriptOutputs(script_run_output_path).then(
            (out: any) => {
              return {
                ...po[p],
                outputs: `${base_url}${out[output]}`,
              };
            }
          );
        })
      ).then((prom) => {
        let desc: any = [];
        prom.forEach((f: any) => {
          desc.push(f.value);
        });
        return desc;
      });
    });
  });
};
