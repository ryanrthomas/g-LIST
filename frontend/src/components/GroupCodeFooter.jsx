import React, { useEffect, useState } from "react";
import "./GroupCodeFooter.css";

export default function GroupCodeFooter() {
  const [groupCode, setGroupCode] = useState("");

  useEffect(() => {
    setGroupCode(localStorage.getItem("group_code"));
  }, []);

  return (
    <div className="group-code-footer">
      Group code: <span>{groupCode}</span>
    </div>
  );
}
