const fmt = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
const esc = s => s.replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
export function buildIcs({ start, end, title, description, location }) {
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CoolRun//EN','BEGIN:VEVENT',
    `UID:${start.getTime()}@coolrun`, `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`, `DESCRIPTION:${esc(description)}`,
    'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:CoolRun window starts in 30 min','END:VALARM',
    'END:VEVENT','END:VCALENDAR'].join('\r\n');
}
export function download(name, text) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/calendar' })), download: name });
  document.body.append(a); a.click(); a.remove();
}
