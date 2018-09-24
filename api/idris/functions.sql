CREATE OR REPLACE FUNCTION pseudo_encrypt(VALUE int) returns int AS $$
DECLARE
l1 int;
l2 int;
r1 int;
r2 int;
i int:=0;
BEGIN
 l1:= (VALUE >> 16) & 65535;
 r1:= VALUE & 65535;
 WHILE i < 3 LOOP
   l2 := r1;
   r2 := l1 # ((((1366 * r1 + 150889) % 47538) / 47538.0) * 32767)::int;
   l1 := l2;
   r1 := r2;
   i := i + 1;
 END LOOP;
 RETURN ((r1 << 16) + l1);
END;
$$ LANGUAGE plpgsql strict immutable;

create or replace function course_year(date) returns text as $$
declare
  current_year int;
  current_month int;
  starting text;
  ending text;
begin
  current_year := cast(extract(year from $1) as int);
  current_month := cast(extract(month from $1) as int);
  starting := cast(case when current_month >= 8 then current_year else current_year - 1 end as text);
  ending := cast(case when current_month >= 8 then current_year + 1 else current_year end as text);
  return concat(starting, '-', ending);
end
$$ language plpgsql;
