export let updateArray = (array, newItem, atIndex) => {
  return array.map((item, index) => (index === atIndex ? newItem : item));
};
