export interface PlazaStore {
  id: string;
  name: string;
  district: string;
  division: string;
  address: string;
  phone: string;
  openHours: string;
  isFlagship?: boolean;
}

export const divisions = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh'
];

export const districtsByDivision: Record<string, string[]> = {
  Dhaka: ['Dhaka City', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Gopalganj'],
  Chattogram: ['Chattogram City', 'Cox\'s Bazar', 'Cumilla', 'Noakhali', 'Feni', 'Brahmanbaria', 'Chandpur'],
  Sylhet: ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rajshahi: ['Rajshahi City', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj'],
  Khulna: ['Khulna City', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat', 'Jhenaidah'],
  Barishal: ['Barishal City', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Rangpur: ['Rangpur City', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Thakurgaon', 'Nilphamari'],
  Mymensingh: ['Mymensingh City', 'Jamalpur', 'Netrokona', 'Sherpur']
};

export const plazaStores: PlazaStore[] = [
  {
    id: 'wp-dhaka-01',
    name: 'DEMO COMPANY Mirpur 10',
    district: 'Dhaka City',
    division: 'Dhaka',
    address: 'Plot # 12, Block # D, Mirpur-10 Circle, Dhaka-1216',
    phone: '+880 1713-442001',
    openHours: '10:00 AM - 08:30 PM',
    isFlagship: true
  },
  {
    id: 'wp-dhaka-02',
    name: 'DEMO COMPANY Dhanmondi',
    district: 'Dhaka City',
    division: 'Dhaka',
    address: 'House # 42, Road # 27 (Old), Dhanmondi, Dhaka-1209',
    phone: '+880 1713-442002',
    openHours: '10:00 AM - 08:30 PM',
    isFlagship: true
  },
  {
    id: 'wp-dhaka-03',
    name: 'DEMO COMPANY Uttara Sector 3',
    district: 'Dhaka City',
    division: 'Dhaka',
    address: 'Plot # 35, Rabindra Sarani, Sector-3, Uttara, Dhaka-1230',
    phone: '+880 1713-442003',
    openHours: '10:00 AM - 08:30 PM',
    isFlagship: true
  },
  {
    id: 'wp-dhaka-04',
    name: 'DEMO COMPANY Bashundhara City',
    district: 'Dhaka City',
    division: 'Dhaka',
    address: 'Level 5, Block B, Bashundhara City Mall, Panthapath, Dhaka',
    phone: '+880 1713-442004',
    openHours: '10:30 AM - 08:00 PM (Closed Tuesday)'
  },
  {
    id: 'wp-ctg-01',
    name: 'DEMO COMPANY GEC Circle',
    district: 'Chattogram City',
    division: 'Chattogram',
    address: 'GEC Circle, CDA Avenue, Nasirabad, Chattogram',
    phone: '+880 1713-442010',
    openHours: '10:00 AM - 08:30 PM',
    isFlagship: true
  },
  {
    id: 'wp-ctg-02',
    name: 'DEMO COMPANY Agrabad',
    district: 'Chattogram City',
    division: 'Chattogram',
    address: 'Commercial Area, Badamtoli Mor, Agrabad, Chattogram',
    phone: '+880 1713-442011',
    openHours: '10:00 AM - 08:30 PM'
  },
  {
    id: 'wp-syl-01',
    name: 'DEMO COMPANY Zindabazar',
    district: 'Sylhet City',
    division: 'Sylhet',
    address: 'Al-Hamra Shopping City, Zindabazar, Sylhet',
    phone: '+880 1713-442020',
    openHours: '10:00 AM - 08:30 PM',
    isFlagship: true
  },
  {
    id: 'wp-raj-01',
    name: 'DEMO COMPANY Shaheb Bazar',
    district: 'Rajshahi City',
    division: 'Rajshahi',
    address: 'Zero Point, Shaheb Bazar, Rajshahi',
    phone: '+880 1713-442030',
    openHours: '10:00 AM - 08:30 PM'
  },
  {
    id: 'wp-khu-01',
    name: 'DEMO COMPANY Dakbangla',
    district: 'Khulna City',
    division: 'Khulna',
    address: 'KDA Avenue, Dakbangla Mor, Khulna',
    phone: '+880 1713-442040',
    openHours: '10:00 AM - 08:30 PM'
  },
  {
    id: 'wp-bar-01',
    name: 'DEMO COMPANY Sadar Road',
    district: 'Barishal City',
    division: 'Barishal',
    address: 'Sadar Road, Opposite to City College, Barishal',
    phone: '+880 1713-442050',
    openHours: '10:00 AM - 08:30 PM'
  }
];
