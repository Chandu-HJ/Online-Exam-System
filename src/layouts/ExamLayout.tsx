import { Outlet } from "react-router-dom";

function ExamLayout() {
  return (
    <div>
      {/* No sidebar here */}
      <Outlet />
    </div>
  );
}

export default ExamLayout;
