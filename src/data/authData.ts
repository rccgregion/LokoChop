import { VendorUser, AdminUser } from '../types';
import { APPROVED_LOKOJA_VENDORS, convertApprovedVendorToUser } from './approvedVendors';

export const MOCK_VENDOR_ACCOUNTS: {
  credentials: { identifier: string; passcode: string; pin?: string };
  user: VendorUser;
}[] = APPROVED_LOKOJA_VENDORS.map(v => ({
  credentials: {
    identifier: v.credentials.identifier,
    passcode: v.credentials.passcode,
    pin: v.credentials.pin,
  },
  user: convertApprovedVendorToUser(v),
}));

export const MOCK_ADMIN_ACCOUNTS: {
  credentials: { username: string; passcode: string; securityPin?: string };
  user: AdminUser;
}[] = [
  {
    credentials: {
      username: 'admin@lokochop.ng',
      passcode: 'confluence2026',
      securityPin: '7700',
    },
    user: {
      id: 'admin-usr-01',
      username: 'superadmin',
      name: 'Engr. Idris Mohammed',
      email: 'admin@lokochop.ng',
      role: 'Super Admin',
      clearanceLevel: 3,
      lastLogin: 'Today, Active Session',
    },
  },
  {
    credentials: {
      username: 'dispatch@lokochop.ng',
      passcode: 'dispatch2026',
      securityPin: '4422',
    },
    user: {
      id: 'admin-usr-02',
      username: 'logistics_lead',
      name: 'Fatima Bello',
      email: 'dispatch@lokochop.ng',
      role: 'Logistics Dispatcher',
      clearanceLevel: 2,
      lastLogin: 'Today, 2 hours ago',
    },
  },
];
