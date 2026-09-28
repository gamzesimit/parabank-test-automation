export type TestUser = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
};

export function buildUser(): TestUser {
  const stamp = Date.now().toString().slice(-9);
  return {
    firstName: 'Qa',
    lastName: `Tester${stamp}`,
    address: '100 Congress Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    phone: '5125550100',
    ssn: '123-45-6789',
    username: `qa_${stamp}`,
    password: 'Passw0rd!23',
  };
}
