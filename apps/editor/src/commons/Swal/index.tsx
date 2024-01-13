import Swal, { SweetAlertIcon } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const MySwal = withReactContent(Swal);

type SwalAlertProps = {
  title: string;
  text: string;
  icon: SweetAlertIcon | undefined;
};
export const alertSwal = ({ title, text, icon }: SwalAlertProps) => {
  MySwal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
  });
};
