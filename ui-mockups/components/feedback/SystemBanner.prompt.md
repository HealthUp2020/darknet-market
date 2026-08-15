Terminal-voiced feedback banner on tinted glass: `error` (red glass, "SYS.ERR //" — also the warning treatment), `success` ("SYS.OK //"), `info` ("SYS.MSG //"). Mono prefix, sentence-case message, optional `[x]` dismiss.

```jsx
<SystemBanner kind="error" code="402">Insufficient credits for this trade.</SystemBanner>
<SystemBanner kind="success" onDismiss={close}>Trade executed. +14 CR.</SystemBanner>
```
