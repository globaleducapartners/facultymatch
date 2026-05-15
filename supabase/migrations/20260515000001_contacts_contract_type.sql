-- Add contract_type column to contacts table
alter table contacts
  add column if not exists contract_type text;
