---
name: tmview-trademark-search
description: "Search trademark registers (INNORPI Tunisia, INPI France, EUIPO, Madrid) for a word and Nice classes through TMview. Use when the user wants a trademark or name-availability check and the national sites are unreachable."
---

# Trademark search via TMview

National sites often block scripts (INNORPI times out, data.inpi.fr returns 403). TMview indexes their data: office codes TN (INNORPI), FR (INPI), EM (EUIPO), WO (Madrid).

1. Open a browser tab on `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=100&criteria=C&basicSearch=<word>` (this sets cookies; direct curl lacks them).
2. From that tab, `fetch` POST `https://www.tmdn.org/tmview/api/search/results?translate=true` with JSON:
   `{page:"1", pageSize:"100", criteria:"C", basicSearch:"<word>", newPage:true, offices:["TN"], niceClass:["35","39"], fields:["tmName","tmOffice","applicationNumber","applicationDate","tradeMarkStatus","niceClass","applicantName"]}`.
   Response: `tradeMarks[]`, `totalResults`. Page until fewer than 100 rows come back; unfiltered common words cap at 2000, so filter by offices and classes.
3. `criteria:"C"` means *contains*: filter results to whole-word matches (regex word boundaries, plus the Arabic spelling).
4. Treat Ended/Expired/Withdrawn/Refused as dead. Report live marks as a table (register, mark, number, classes, owner), plus an explicit "none found" per register with the date.
5. State that the source was TMview, not the national site, and that it is a register search, not legal clearance.
