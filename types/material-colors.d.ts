declare module 'material-colors' {
  const colors: {
    [color: string]: {
      [shade: string]: string;
    };
  };
  export = colors;
}
