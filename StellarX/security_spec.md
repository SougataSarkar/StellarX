# Firestore Security Specification

## Data Invariants
1. A discovery must belong to a valid user (userId must match request.auth.uid).
2. A discovery must have a name, type, distance, and timestamp.
3. Users can only read their own discoveries.

## The "Dirty Dozen" Payloads
1. **Unauthenticated Read**: Querying discoveries without auth. (Expected: Denied)
2. **Cross-User Read**: Querying someone else's discoveries. (Expected: Denied)
3. **Cross-User Write**: Creating a discovery with someone else's userId. (Expected: Denied)
4. **Invalid Schema**: Creating a discovery missing the 'name' field. (Expected: Denied)
5. **Ghost Field Update**: Updating a discovery with an extra 'isAdmin' field. (Expected: Denied)
6. **Type Mismatch**: Creating a discovery where 'distance' is an integer instead of string. (Expected: Denied)
7. **Size Limit Exceeded**: Creating a discovery with a name > 128 characters. (Expected: Denied)
8. **Spoofed Timestamp**: Creating a discovery with a timestamp from 2020. (Expected: Denied)
9. **Update Immutable Field**: Changing the userId of an existing discovery. (Expected: Denied)
10. **Malicious ID**: Creating a discovery with a 2MB string ID. (Expected: Denied)
11. **Denial of Wallet Read**: Listing all discoveries globally. (Expected: Denied)
12. **Malformed Type**: Setting type to boolean. (Expected: Denied)
