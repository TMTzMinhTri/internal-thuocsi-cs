const convertReasonList = (data) => {
  console.log('convert reasons list  >', data);
  return data?.reduce((map, { code, name }) => {
    map[code] = name;
    return map;
  }, {});
};

export default { convertReasonList };
