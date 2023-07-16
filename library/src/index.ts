interface Method {
  (): any;
}

export const method: Method = () => {
  console.log(navigator.gpu);
};
