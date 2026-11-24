import WifiIcon from '@mui/icons-material/Wifi';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import KitchenIcon from '@mui/icons-material/Kitchen';
import CountertopsIcon from '@mui/icons-material/Countertops';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ICON_MAP = {
  wifi: WifiIcon,
  food: RestaurantIcon,
  ac: AcUnitIcon,
  attached_bathroom: BathtubIcon,
  laundry: LocalLaundryServiceIcon,
  washing_machine: LocalLaundryServiceIcon,
  cctv: SecurityIcon,
  power_backup: BoltIcon,
  parking: LocalParkingIcon,
  housekeeping: CleaningServicesIcon,
  drinking_water: WaterDropIcon,
  refrigerator: KitchenIcon,
  common_kitchen: CountertopsIcon,
};

export default function AmenityIcon({ id, fontSize = 'small', color = 'primary' }) {
  const IconComp = ICON_MAP[id] || CheckCircleOutlineIcon;
  return <IconComp fontSize={fontSize} color={color} />;
}
