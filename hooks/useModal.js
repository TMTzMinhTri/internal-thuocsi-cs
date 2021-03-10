const { useState } = require('react');

const useModal = (data = false) => {
  const [isShowing, setIsShowing] = useState(data);
  function toggle() {
    setIsShowing(!isShowing);
  }
  return [isShowing, toggle];
};

export default useModal;
