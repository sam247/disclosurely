-- Create AI Case Analyses table
create table if not exists "public"."ai_case_analyses" (
  "id" uuid not null default gen_random_uuid(),
  "case_id" uuid not null,
  "organization_id" uuid not null,
  "case_title" text not null,
  "tracking_id" text not null,
  "analysis_content" text not null,
  "created_at" timestamp with time zone not null default now(),
  "created_by" uuid not null,
  constraint "ai_case_analyses_pkey" primary key ("id"),
  constraint "ai_case_analyses_case_id_fkey" foreign key ("case_id") references "public"."reports"("id") on delete cascade,
  constraint "ai_case_analyses_organization_id_fkey" foreign key ("organization_id") references "public"."organizations"("id") on delete cascade,
  constraint "ai_case_analyses_created_by_fkey" foreign key ("created_by") references "public"."profiles"("id") on delete cascade
);

-- Enable RLS
alter table "public"."ai_case_analyses" enable row level security;

-- Create policies
create policy "Users can view analyses for their organization" on "public"."ai_case_analyses"
  for select using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can create analyses for their organization" on "public"."ai_case_analyses"
  for insert with check (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    ) and created_by = auth.uid()
  );

create policy "Users can update their own analyses" on "public"."ai_case_analyses"
  for update using (
    created_by = auth.uid() and
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can delete their own analyses" on "public"."ai_case_analyses"
  for delete using (
    created_by = auth.uid() and
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );
