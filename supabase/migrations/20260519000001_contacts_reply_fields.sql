-- Add reply fields to contacts table
alter table contacts
  add column if not exists reply_message text,
  add column if not exists replied_at timestamptz;
