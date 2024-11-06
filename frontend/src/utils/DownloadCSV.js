  const convertToCSV = (objArray) => {
    console.log("objArray ", objArray)
    const array = typeof objArray === 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') line += ',';

        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return typeof objArray === 'object' ? str : objArray;
  };

  export const downloadCSV = ({ data, fileName }) => {
    const BOM = new Uint8Array([0xEF,0xBB,0xBF]);

    const csvData = new Blob([BOM, convertToCSV(data)], { encoding:"UTF-8",type:"text/csv;charset=UTF-8"});
    const csvURL = URL.createObjectURL(csvData, );
    const link = document.createElement('a');
    link.href = csvURL;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  export const downloadJSON = ({ data, fileName }) => {
    const jsonData = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const jsonURL = URL.createObjectURL(jsonData);
    const link = document.createElement('a');
    link.href = jsonURL;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

