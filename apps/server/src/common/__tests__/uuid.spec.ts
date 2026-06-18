import { generateUUIDv4, generateUUIDv7, generateOrderId, generateInviteCode, generateSessionId, generateMessageSid } from '../uuid';

describe('uuid', () => {
  describe('generateUUIDv4', () => {
    it('should return a valid UUID v4 format', () => {
      const uuid = generateUUIDv4();
      // UUID v4 regex: 8-4-4-4-12 hex digits
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should produce unique values across multiple calls', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateUUIDv4()));
      expect(ids.size).toBe(100);
    });
  });

  describe('generateOrderId', () => {
    it('should start with "ord_" prefix', () => {
      const orderId = generateOrderId();
      expect(orderId.startsWith('ord_')).toBe(true);
    });

    it('should have length > 40 (UUID v7 is 36 chars + "ord_")', () => {
      const orderId = generateOrderId();
      expect(orderId.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe('generateInviteCode', () => {
    it('should format as ACE-{PREFIX}-{4 digits}', () => {
      const code = generateInviteCode('TestPartner');
      expect(code).toMatch(/^ACE-TES-\d{4}$/);
    });

    it('should uppercase the prefix', () => {
      const code = generateInviteCode('lowercase');
      expect(code).toMatch(/^ACE-LOW-\d{4}$/);
    });
  });

  describe('generateSessionId', () => {
    it('should start with "sess_" prefix', () => {
      const sid = generateSessionId();
      expect(sid.startsWith('sess_')).toBe(true);
    });
  });

  describe('generateMessageSid', () => {
    it('should start with "wa_" prefix', () => {
      const sid = generateMessageSid();
      expect(sid.startsWith('wa_')).toBe(true);
    });

    it('should be 13 characters (wa_ + 10 alphanumeric)', () => {
      const sid = generateMessageSid();
      expect(sid.length).toBe(13);
    });
  });
});
