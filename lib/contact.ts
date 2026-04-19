export const LOCATION_MAP_URL = "https://www.bing.com/maps/search?v=2&pc=FACEBK&mid=8100&mkt=en-US&fbclid=IwY2xjawRSEtNleHRuA2FlbQIxMABicmlkETE5cUN6TUgzWXA3cTNhbTNQc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHldqvuL5Y6A39iLq6VYbIzZSBf4Yjo7bMUwz0IaQeKO3qDMD4RtVMdCc_5C6_aem_vhVbg-JwLrvrhjq9wU5fpw&FORM=FBKPL1&q=%D8%B4.+%D8%B9%D8%A8%D8%AF+%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85+%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AF%D9%8A%2C+Amman%2C+Jordan%2C+%0911947&cp=31.873657~35.981407&lvl=11&style=r";

export const CONTACT_LINKS = [
  { label: "Phone", href: "+962798783978" },
  {
    label: "WhatsApp",
    href: "https://api.whatsapp.com/send?phone=%2B962798783978&token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyNSJ9.eyJleHAiOjE3NzY3MTAxMzYsInBob25lIjoiKzk2Mjc5ODc4Mzk3OCIsImNvbnRleHQiOiJBZmlmaHVTRGpaMTduRUlrenE4cGRVWjBCTUVsY3VnZXE3X0hmVHdZRnA1WTMtUVhXeDJBUURqRHRMWFNZLWl3YWN2NUQwN2JZQ04yTzdiQ0NuTUJuTmNzQmtSVzBjTTB0NDlpQzdCc0dPX3dockx5elBEZnhrRzFyOGZ1V0V3SEdVQkwxeHlSU3lQeVJhTGxueUJOTHg5dV9RIiwic291cmNlIjoiRkJfUGFnZSIsImFwcCI6ImZhY2Vib29rIiwiZW50cnlfcG9pbnQiOiJwYWdlX2N0YSJ9.caulD87tSSoupull55zwYhhRrBAGiuouDYOrjOQNWF6Wv2z9lPdUi885re7bx9p-AOt8Mi8srvAw1zcGrKoNAw&fbclid=IwY2xjawRSEOpleHRuA2FlbQIxMABicmlkETE5cUN6TUgzWXA3cTNhbTNQc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjobE-cVg8KD1FGw5xLhJ8sNsdyvRKzVuS9t1eazI2w72AzLXjIR_r7D98u1_aem_aczdY3hnvlglUfcP2MN7qg",
  },
  { label: "Facebook", href: "https://web.facebook.com/SHELBAYA2022" },
  { label: "Location", href: LOCATION_MAP_URL },
] as const;

export function resolveContactHref(href: string) {
  return href.startsWith("+") ? `tel:${href}` : href;
}

export function isExternalContactHref(href: string) {
  return /^https?:\/\//i.test(href);
}