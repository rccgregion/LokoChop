import { CustomerReview, CateringInquiry, VendorRemittanceRecord } from '../types';

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    vendorId: 'mama-ngozi',
    vendorName: "Mama Ngozi's Kitchen",
    foodItemName: 'Smoky Party Jollof + Fried Dodo & Tender Goat Meat',
    customerName: 'Fatima Abubakar',
    customerLocation: 'Lokongoma Phase II',
    rating: 5,
    reviewText: 'The firewood aroma on this jollof is unbeatable in all of Lokoja! The goat meat was so tender and the plantain was sweet. Delivery rider Ibrahim arrived in 18 minutes flat.',
    date: 'Today, 1:45 PM',
    verifiedOrder: true,
    likesCount: 14
  },
  {
    id: 'rev-2',
    vendorId: 'mama-ngozi',
    vendorName: "Mama Ngozi's Kitchen",
    foodItemName: 'Pounded Yam + Fisherman Catfish Soup',
    customerName: 'Engr. David Oche',
    customerLocation: 'Zone 8 Secretariat Axis',
    rating: 5,
    reviewText: 'Authentic Confluence river taste. Scent leaf and utazi were fresh, pounded yam was smooth with zero lumps. Best lunch after a hectic ministry meeting.',
    date: 'Yesterday, 2:10 PM',
    verifiedOrder: true,
    likesCount: 9
  },
  {
    id: 'rev-3',
    vendorId: 'chicken-republic',
    vendorName: 'Chicken Republic Lokoja',
    foodItemName: 'Express Refuel Max Combo',
    customerName: 'Babatunde Adebayo',
    customerLocation: 'Paparanda Square',
    rating: 4,
    reviewText: 'Fast pickup and crunchy spicy chicken. Very consistent quality, though packaging was slightly hot to touch. Overall highly recommended!',
    date: 'Yesterday, 7:20 PM',
    verifiedOrder: true,
    likesCount: 6
  },
  {
    id: 'rev-4',
    vendorId: 'craving-spot',
    vendorName: 'CRAVING SPOT',
    foodItemName: 'Custom Double-Sausage Chicken Shawarma',
    customerName: 'Blessing Yusuf',
    customerLocation: 'Adankolo Road',
    rating: 5,
    reviewText: 'Craving Spot makes the best loaded shawarma in town. The double sausage with spiced mayo is huge and filling. Late night delivery was super prompt.',
    date: '2 days ago',
    verifiedOrder: true,
    likesCount: 19
  },
  {
    id: 'rev-5',
    vendorId: 'confluence-grill',
    vendorName: 'Confluence Grill Point',
    foodItemName: 'Confluence Point & Kill Charcoal Catfish',
    customerName: 'Usman Mohammed',
    customerLocation: 'GRA Quarters',
    rating: 5,
    reviewText: 'Direct from river Niger to charcoal grill! The pepper marinade has a fiery kick, and the roasted boli was golden. Paired with cold zobo, heavenly.',
    date: '3 days ago',
    verifiedOrder: true,
    likesCount: 12
  },
  {
    id: 'rev-6',
    vendorId: 'misi-t-gra',
    vendorName: 'Misi T Restaurant (GRA)',
    foodItemName: 'Amala with Gbegiri & Ewedu + Assorted Bushmeat',
    customerName: 'Mrs. Folake Ajayi',
    customerLocation: 'Township / GRA',
    rating: 5,
    reviewText: 'Standard Yoruba buka taste right here in Lokoja. Hot elastic amala with smooth gbegiri. My colleagues at the hospital order here every Friday.',
    date: '4 days ago',
    verifiedOrder: true,
    likesCount: 8
  },
  {
    id: 'rev-7',
    vendorId: 'mama-ngozi',
    vendorName: "Mama Ngozi's Kitchen",
    foodItemName: 'Confluence Point & Kill Charcoal Catfish',
    customerName: 'Chinedu Eze',
    customerLocation: 'Ganaja Junction',
    rating: 4,
    reviewText: 'Very delicious fresh catfish. Took about 25 minutes to cook fresh from the live tank, but the wait was worth every bite. Will definitely reorder.',
    date: '5 days ago',
    verifiedOrder: true,
    likesCount: 5
  }
];

export const INITIAL_CATERING_INQUIRIES: CateringInquiry[] = [
  {
    id: 'CAT-LK-9042',
    vendorId: 'mama-ngozi',
    vendorName: "Mama Ngozi's Kitchen",
    customerName: 'Barrister Yakubu Ibrahim',
    phone: '+2348035512390',
    whatsapp: '+2348035512390',
    eventType: 'Corporate Workshop / Zone 8 Secretariat',
    guestCount: 65,
    eventDate: '2026-09-18',
    eventTime: '12:30 PM',
    deliveryVenue: 'Kogi State Internal Revenue Service Conference Hall, Zone 8, Lokoja',
    menuPreferences: 'Smoky Firewood Jollof + Fried Rice with Grilled Chicken, Pounded Yam & Egusi for VIPs, Chilled Zobo Bottles',
    estimatedBudget: 350000,
    specialRequests: 'Thermal warmer delivery needed by 11:45 AM. Individual packaging with cutlery packs.',
    createdAt: 'Yesterday, 10:15 AM',
    status: 'Quote Sent'
  },
  {
    id: 'CAT-LK-8910',
    vendorId: 'mama-ngozi',
    vendorName: "Mama Ngozi's Kitchen",
    customerName: 'Grace Ameh',
    phone: '+2348123498711',
    whatsapp: '+2348123498711',
    eventType: 'Wedding Reception',
    guestCount: 200,
    eventDate: '2026-10-04',
    eventTime: '2:00 PM',
    deliveryVenue: 'Reverton Hotel Grand Hall, GRA, Lokoja',
    menuPreferences: 'Full Buffet Service: Firewood Jollof, Semo/Pounded Yam, Fresh Catfish Fisherman Broth, Small Chops trays',
    estimatedBudget: 950000,
    specialRequests: 'Requires 4 catering attendants for chafing dish stations.',
    createdAt: '3 days ago',
    status: 'Confirmed & Booked'
  }
];

export const INITIAL_REMITTANCES: VendorRemittanceRecord[] = [
  {
    id: 'RMT-LK-801',
    vendorId: 'mama-ngozi',
    vendorName: "Mama Ngozi's Kitchen",
    amount: 12500,
    accruedPeriod: 'Aug 24 – Aug 30 (Weekly)',
    reference: 'TRF-LOKO-892147',
    paymentMethod: 'Direct Bank Transfer',
    status: 'Verified & Settled',
    date: '2026-08-31 09:20 AM',
    proofMemo: 'First Bank NIP transfer to Providus Bank (LokoChop Corporate)'
  },
  {
    id: 'RMT-LK-802',
    vendorId: 'chicken-republic',
    vendorName: 'Chicken Republic Lokoja',
    amount: 28400,
    accruedPeriod: 'Aug 24 – Aug 30 (Weekly)',
    reference: 'PAY-CR-449120',
    paymentMethod: 'Paystack Card/USSD',
    status: 'Verified & Settled',
    date: '2026-08-31 11:45 AM',
    proofMemo: 'Automated card billing via registered corporate card'
  },
  {
    id: 'RMT-LK-803',
    vendorId: 'craving-spot',
    vendorName: 'CRAVING SPOT',
    amount: 9800,
    accruedPeriod: 'Aug 24 – Aug 30 (Weekly)',
    reference: 'TRF-CS-338192',
    paymentMethod: 'Direct Bank Transfer',
    status: 'Verified & Settled',
    date: '2026-09-01 02:15 PM',
    proofMemo: 'GTBank mobile transfer reference confirmed'
  }
];
