const convertReasonList = (data) =>
  data?.reduce((map, { code, name }) => {
    map[code] = name;
    return map;
  }, {});

export default { convertReasonList };
