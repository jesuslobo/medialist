const parseJSONReq = (jsonString: string) => typeof jsonString === 'string' ? JSON.parse(jsonString || '{}') : jsonString;

export default parseJSONReq;