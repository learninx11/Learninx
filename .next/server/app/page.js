(()=>{var e={};e.id=931,e.ids=[931],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9396:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>a.a,__next_app__:()=>p,originalPathname:()=>m,pages:()=>d,routeModule:()=>h,tree:()=>c}),s(3462),s(6782),s(1930),s(2523);var r=s(3191),n=s(8716),o=s(7922),a=s.n(o),i=s(5231),l={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>i[e]);s.d(t,l);let c=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,3462)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\page.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,6782)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\layout.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,1930)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\loading.tsx"],"not-found":[()=>Promise.resolve().then(s.bind(s,2523)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\not-found.tsx"]}],d=["D:\\OSPs\\Learninx\\Learninx\\src\\app\\page.tsx"],m="/page",p={require:s,loadChunk:()=>Promise.resolve()},h=new r.AppPageRouteModule({definition:{kind:n.x.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},4087:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,9404,23)),Promise.resolve().then(s.bind(s,7554)),Promise.resolve().then(s.bind(s,7e3)),Promise.resolve().then(s.bind(s,893))},434:(e,t,s)=>{"use strict";s.d(t,{default:()=>n.a});var r=s(9404),n=s.n(r)},7554:(e,t,s)=>{"use strict";s.d(t,{DailyTipCard:()=>c});var r=s(326),n=s(434),o=s(7577),a=s(8539),i=s(3597),l=s(3173);function c(){let{ready:e,state:t,markTipSeen:s}=(0,l.S)(),[c,m]=(0,o.useState)(null),[p,h]=(0,o.useState)(null),x=e&&null!=p&&t.lastTipDay===p;return null==c?r.jsx(d,{}):x?null:(0,r.jsxs)("article",{className:"lx-card relative overflow-hidden p-5 sm:p-6",children:[r.jsx("div",{className:"pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--lx-accent-glow)] blur-3xl","aria-hidden":!0}),(0,r.jsxs)("div",{className:"flex items-center gap-2",children:[(0,r.jsxs)(i.DR,{tone:"accent",children:[r.jsx(a.WG,{size:12})," Tip of the day"]}),r.jsx("span",{className:"text-xs text-[var(--lx-muted)]",children:p})]}),r.jsx("h2",{className:"mt-3 text-lg font-semibold sm:text-xl",children:c.title}),r.jsx("p",{className:"mt-2 text-sm leading-relaxed text-[var(--lx-muted)]",children:c.body}),r.jsx("pre",{className:"mt-3 overflow-x-auto rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] px-3 py-2 font-mono text-xs text-[var(--lx-fg)]",children:r.jsx("code",{children:c.example})}),(0,r.jsxs)("div",{className:"mt-4 flex items-center gap-2",children:[r.jsx("button",{type:"button",onClick:s,className:"lx-btn lx-btn-secondary lx-btn-sm",children:"Got it"}),(0,r.jsxs)(n.default,{href:"/cheatsheet",className:"inline-flex items-center gap-1 text-xs text-[var(--lx-accent)] hover:underline",children:["See the cheatsheet ",r.jsx(a.LZ,{size:12})]})]})]})}function d(){return r.jsx("div",{className:"lx-card h-48 animate-pulse p-5 sm:p-6","aria-hidden":!0})}},7e3:(e,t,s)=>{"use strict";s.d(t,{HomeCtaButton:()=>l,HomeCtaText:()=>i,HomeProgress:()=>a});var r=s(326),n=s(3597),o=s(3173);function a({totalLessons:e}){let{state:t,ready:s}=(0,o.S)(),a=t.completed.length,i=0===a&&0===Object.keys(t.quiz).length;return r.jsx(n.ko,{value:s?a:0,max:e,label:s?i?"Begin your journey":"Lessons completed":"Loading progress…"})}function i({totalLessons:e}){let{state:t,ready:s}=(0,o.S)();if(!s)return(0,r.jsxs)(r.Fragment,{children:[r.jsx("h2",{className:"mt-3 text-xl font-semibold sm:text-2xl",children:"Open the first lesson"}),r.jsx("p",{className:"mt-2 text-sm text-slate-400",children:"A 5-minute warm-up. You only need a keyboard."})]});let n=t.completed.length,a=Object.keys(t.quiz).length,i=0===n&&0===a;return(0,r.jsxs)(r.Fragment,{children:[r.jsx("h2",{className:"mt-3 text-xl font-semibold sm:text-2xl",children:i?"Open the first lesson":"Pick up where you left off"}),r.jsx("p",{className:"mt-2 text-sm text-slate-400",children:i?"A 5-minute warm-up. You only need a keyboard.":`You've completed ${n} of ${e} lessons. ${a} quiz attempt${1===a?"":"s"} so far.`})]})}function l({totalLessons:e}){let{state:t,ready:s}=(0,o.S)(),n=t.completed.length,a=Object.keys(t.quiz).length;return s&&(0!==n||0!==a)?r.jsx(r.Fragment,{children:"Continue learning"}):r.jsx(r.Fragment,{children:"Open the first lesson"})}},893:(e,t,s)=>{"use strict";s.d(t,{StreakWidget:()=>i});var r=s(326),n=s(8539),o=s(3597),a=s(3173);function i({variant:e="card"}){let{state:t,ready:s}=(0,a.S)(),i=t.streak,c=s?i:{current:0,best:0,lastActiveDay:null,totalCompletions:0,totalCorrect:0,points:0};return"inline"===e?(0,r.jsxs)("div",{className:"flex flex-wrap items-center gap-2 text-xs",children:[(0,r.jsxs)(o.DR,{tone:"accent",children:[r.jsx(n.Yq,{size:10})," ",c.current,"-day streak"]}),(0,r.jsxs)(o.DR,{tone:"default",children:[r.jsx(n.r7,{size:10})," ",c.points," pts"]}),(0,r.jsxs)(o.DR,{tone:"default",children:[r.jsx(n.cK,{size:10})," ",c.totalCompletions," done"]})]}):(0,r.jsxs)("div",{className:"lx-card p-5 sm:p-6",children:[r.jsx("div",{className:"flex items-center gap-2",children:(0,r.jsxs)(o.DR,{tone:"accent",children:[r.jsx(n.Yq,{size:12})," Streak"]})}),(0,r.jsxs)("div",{className:"mt-3 flex items-baseline gap-2",children:[r.jsx("span",{className:"font-mono text-4xl font-bold text-[var(--lx-accent)]",children:c.current}),(0,r.jsxs)("span",{className:"text-sm text-[var(--lx-muted)]",children:["day",1===c.current?"":"s"," in a row"]})]}),(0,r.jsxs)("p",{className:"mt-1 text-xs text-[var(--lx-muted)]",children:["Best streak so far: ",c.best," day",1===c.best?"":"s","."]}),(0,r.jsxs)("div",{className:"mt-4 grid grid-cols-3 gap-2 text-center text-xs",children:[r.jsx(l,{label:"Points",value:c.points}),r.jsx(l,{label:"Lessons",value:c.totalCompletions}),r.jsx(l,{label:"Correct",value:c.totalCorrect})]}),r.jsx("p",{className:"mt-3 text-[0.65rem] text-[var(--lx-muted)]",children:"+10 points per lesson, +1 per correct quiz answer. Missing a day resets the streak to 1."})]})}function l({label:e,value:t}){return(0,r.jsxs)("div",{className:"rounded-md border border-[var(--lx-border)] bg-[var(--lx-bg-elevated)]/40 px-2 py-2",children:[r.jsx("div",{className:"font-mono text-base font-semibold text-[var(--lx-fg)]",children:t}),r.jsx("div",{className:"text-[0.6rem] uppercase tracking-wider text-[var(--lx-muted)]",children:e})]})}},3462:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>u});var r=s(9510),n=s(7371),o=s(631),a=s(8027),i=s(6891),l=s(9753),c=s(8570);let d=(0,c.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\app\_home-progress.tsx#HomeProgress`),m=(0,c.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\app\_home-progress.tsx#HomeCtaText`),p=(0,c.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\app\_home-progress.tsx#HomeCtaButton`),h=(0,c.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\app\_daily-tip.tsx#DailyTipCard`),x=(0,c.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\components\StreakWidget.tsx#StreakWidget`);function u(){let e=(0,i._M)();return(0,l.e8)(),(0,r.jsxs)("div",{className:"space-y-16",children:[(0,r.jsxs)("section",{className:"relative pt-6 pb-2 text-center sm:pt-10",children:[(0,r.jsxs)("div",{className:"mb-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]",children:[r.jsx(o.Fx,{size:12})," ~/welcome $ cat about.txt"]}),(0,r.jsxs)("h1",{className:"mx-auto max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl",children:["Learn"," ",r.jsx("span",{className:"bg-gradient-to-r from-[var(--lx-accent)] to-[var(--lx-accent-2)] bg-clip-text text-transparent",children:"Linux"}),r.jsx("br",{className:"hidden sm:block"})," the easy way."]}),r.jsx("p",{className:"mx-auto mt-5 max-w-2xl text-pretty text-base text-slate-400 sm:text-lg",children:"Bite-sized lessons, hands-on challenges, and a safe in-browser terminal. No signup. No install. Just open the site and start typing commands."}),(0,r.jsxs)("div",{className:"mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4",children:[(0,r.jsxs)(n.default,{href:"/lessons",className:"lx-btn lx-btn-primary w-full sm:w-auto",children:["Start learning ",r.jsx(o.LZ,{size:16})]}),r.jsx("a",{href:"#how-it-works",className:"lx-btn lx-btn-secondary w-full sm:w-auto",children:"How it works"})]}),r.jsx("div",{className:"mx-auto mt-10 max-w-md",children:r.jsx(d,{totalLessons:e.length})}),(0,r.jsxs)("p",{className:"mt-4 text-xs text-slate-500",children:[e.length," lessons available \xb7 free forever \xb7 your progress is saved on this browser"]})]}),(0,r.jsxs)("section",{id:"how-it-works",className:"scroll-mt-20 space-y-6",children:[r.jsx("div",{className:"flex items-end justify-between",children:(0,r.jsxs)("div",{children:[(0,r.jsxs)(a.DR,{tone:"accent",children:[r.jsx(o.T$,{size:12})," How it works"]}),r.jsx("h2",{className:"mt-3 text-2xl font-semibold sm:text-3xl",children:"Three steps. One sandbox."})]})}),(0,r.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[r.jsx(f,{step:"01",icon:r.jsx(o.vJ,{size:20}),title:"Step-by-step lessons",body:"From your first `ls` to systemd and shell scripting — short chapters with real examples you can read in 5 minutes."}),r.jsx(f,{step:"02",icon:r.jsx(o.rc,{size:20}),title:"Live terminal sandbox",body:"Practice in a safe, simulated shell right in your browser. Realistic prompt, file system, and history. Nothing touches your machine."}),r.jsx(f,{step:"03",icon:r.jsx(o.rm,{size:20}),title:"Quizzes & tracking",body:"Answer quick questions at the end of each lesson. Pass 80% and the lesson is marked complete. Your progress saves automatically."})]})]}),(0,r.jsxs)("section",{className:"grid gap-4 lg:grid-cols-[1.4fr_1fr]",children:[r.jsx("div",{className:"space-y-4",children:r.jsx(h,{})}),r.jsx(x,{})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[r.jsx("div",{className:"flex items-end justify-between",children:(0,r.jsxs)("div",{children:[(0,r.jsxs)(a.DR,{tone:"accent",children:[r.jsx(o.cK,{size:12})," More to explore"]}),r.jsx("h2",{className:"mt-3 text-2xl font-semibold sm:text-3xl",children:"New tools for self-directed learners."})]})}),(0,r.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[r.jsx(g,{href:"/cheatsheet",icon:r.jsx(o.vJ,{size:20}),title:"Cheatsheet",body:"A searchable reference of every command the in-browser sandbox supports, with examples and category filters."}),r.jsx(g,{href:"/boss",icon:r.jsx(o.cK,{size:20}),title:"Boss levels",body:"Multi-step challenges — restore a broken service, sort a messy log folder, and more. Sandbox resets between steps."}),r.jsx(g,{href:"/lessons",icon:r.jsx(o.WG,{size:20}),title:"Streaks & points",body:"Earn 10 points per completed lesson and 1 per correct quiz answer. Keep the streak alive by showing up daily."})]})]}),(0,r.jsxs)("section",{className:"grid gap-4 lg:grid-cols-[1.4fr_1fr]",children:[(0,r.jsxs)("div",{className:"lx-card relative overflow-hidden p-6 sm:p-8",children:[r.jsx("div",{className:"pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--lx-accent-glow)] blur-3xl"}),r.jsx(a.DR,{tone:"accent",children:"Who is this for?"}),r.jsx("h2",{className:"mt-3 text-xl font-semibold sm:text-2xl",children:"For anyone who wants to feel at home on a Linux box."}),(0,r.jsxs)("ul",{className:"mt-4 space-y-2.5 text-[var(--lx-fg)]",children:[(0,r.jsxs)("li",{className:"flex gap-3",children:[r.jsx("span",{className:"mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-accent)]","aria-hidden":!0}),r.jsx("span",{children:"Beginners who have never opened a terminal."})]}),(0,r.jsxs)("li",{className:"flex gap-3",children:[r.jsx("span",{className:"mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-accent)]","aria-hidden":!0}),r.jsx("span",{children:"Developers who want to be comfortable on a server."})]}),(0,r.jsxs)("li",{className:"flex gap-3",children:[r.jsx("span",{className:"mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-accent)]","aria-hidden":!0}),r.jsx("span",{children:"Students preparing for DevOps, cloud, or sysadmin roles."})]})]})]}),(0,r.jsxs)("div",{className:"lx-card flex flex-col justify-between gap-4 p-6 sm:p-8",children:[(0,r.jsxs)("div",{children:[r.jsx(a.DR,{tone:"success",children:"Ready when you are"}),r.jsx(m,{totalLessons:e.length})]}),(0,r.jsxs)(n.default,{href:"/lessons",className:"lx-btn lx-btn-secondary self-start",children:[r.jsx(p,{totalLessons:e.length}),r.jsx(o.LZ,{size:14})]})]})]})]})}function g({href:e,icon:t,title:s,body:a}){return(0,r.jsxs)(n.default,{href:e,className:"lx-card group relative flex flex-col gap-2 overflow-hidden p-5 sm:p-6",children:[r.jsx("div",{className:"pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--lx-accent-glow)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100","aria-hidden":!0}),r.jsx("span",{className:"inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--lx-border)] bg-slate-900/40 text-[var(--lx-accent)] transition group-hover:border-[var(--lx-accent)]/40","aria-hidden":!0,children:t}),r.jsx("h3",{className:"font-semibold text-[var(--lx-fg)]",children:s}),r.jsx("p",{className:"text-sm leading-relaxed text-[var(--lx-muted)]",children:a}),(0,r.jsxs)("span",{className:"mt-auto inline-flex items-center gap-1 text-xs text-[var(--lx-accent)]",children:["Open ",r.jsx(o.LZ,{size:12})]})]})}function f({step:e,icon:t,title:s,body:n}){return(0,r.jsxs)("div",{className:"lx-card group relative overflow-hidden p-6",children:[r.jsx("div",{className:"pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--lx-accent-glow)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100","aria-hidden":!0}),(0,r.jsxs)("div",{className:"flex items-center justify-between",children:[r.jsx("span",{className:"inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-[var(--lx-accent)] transition group-hover:border-[var(--lx-accent)]/40","aria-hidden":!0,children:t}),r.jsx("span",{className:"font-mono text-xs text-slate-500",children:e})]}),r.jsx("h3",{className:"mt-4 font-semibold text-lg",children:s}),r.jsx("p",{className:"mt-1.5 text-sm leading-relaxed text-slate-400",children:n})]})}},8027:(e,t,s)=>{"use strict";s.d(t,{DR:()=>n});var r=s(9510);function n({children:e,tone:t="default",className:s=""}){return r.jsx("span",{className:`lx-pill ${"success"===t?"lx-pill-success":"accent"===t?"lx-pill-accent":"beginner"===t?"lx-pill-beginner":"intermediate"===t?"lx-pill-intermediate":"advanced"===t?"lx-pill-advanced":""} ${s}`,children:e})}s(1159)},9753:(e,t,s)=>{"use strict";function r(e,t){if("/"===t||""===t)return e;let s=t.split("/").filter(e=>e.length>0),r=e;for(let e of s){if(!r||"dir"!==r.type)return;let t=r.children[e];if(!t)return;r=t}return r}function n(e,t){let s=r(e,t);return!!s&&"file"===s.type}function o(e,t){let s=r(e,t);return!!s&&"dir"===s.type}function a(e){return e.replace(/\s+/g," ").trim()}s.d(t,{e8:()=>c,vj:()=>l});let i=[{id:"recover-the-server",slug:"recover-the-server",title:"Recover the server",description:"A service config got clobbered. Restore the right file contents, fix permissions, and confirm the service can start.",difficulty:"intermediate",order:1,seedVfs:e=>{let t=r(e,"/etc"),s=r(e,"/usr/local/bin");t&&s&&(t.children["myapp.conf"]={type:"file",content:"PORT=__FILL_ME__\n"},t.children["myapp.conf.bak"]={type:"file",content:"PORT=8080\nLOG_LEVEL=info\n"},s.children["myapp-ctl"]={type:"file",content:'#!/bin/sh\necho "starting"\n'})},steps:[{title:"Inspect the broken config",prompt:"Use `cat` to look at `/etc/myapp.conf` and confirm it is broken. Try also reading `/etc/myapp.conf.bak` to see what the good values look like.",verify:({command:e,output:t})=>{let s=a(e).toLowerCase();return"cat /etc/myapp.conf"===s||"cat /etc/myapp.conf.bak"===s?/__FILL_ME__|PORT=8080|LOG_LEVEL/.test(t)?{ok:!0,message:"Confirmed: the backup has the right values."}:{ok:!1,message:"The output did not look like a config file. Try again."}:{ok:!1,message:"Try `cat /etc/myapp.conf` or `cat /etc/myapp.conf.bak`."}}},{title:"Restore the config",prompt:"Overwrite `/etc/myapp.conf` with the contents of `/etc/myapp.conf.bak`. You can do it in a single command with `cp`.",verify:({command:e,fs:t})=>{if(!a(e).toLowerCase().startsWith("cp "))return{ok:!1,message:"Use `cp` to copy the backup over the file."};let s=function(e,t){let s=r(e,t);return s&&"file"===s.type?s.content??"":null}(t,"/etc/myapp.conf")??"";return s.includes("__FILL_ME__")||!s.includes("PORT=8080")?{ok:!1,message:"The file still looks wrong. Try `cp /etc/myapp.conf.bak /etc/myapp.conf`."}:{ok:!0,message:"Config restored."}}},{title:"Make the control script executable",prompt:"The `/usr/local/bin/myapp-ctl` script needs the executable bit. Run `chmod` on it (the sandbox is simulated, so we just check your command).",verify:({command:e})=>{let t=a(e).toLowerCase();return t.startsWith("chmod ")?t.includes("/usr/local/bin/myapp-ctl")?/\+x/.test(t)||/\b7[0-7]{2}\b/.test(t)?{ok:!0,message:"Permissions set."}:{ok:!1,message:"Set the executable bit (e.g. `chmod +x ...` or `chmod 755 ...`)."}:{ok:!1,message:"Make sure you target `/usr/local/bin/myapp-ctl`."}:{ok:!1,message:"Use `chmod` to set the executable bit."}}},{title:"Clean up",prompt:"Remove the backup file at `/etc/myapp.conf.bak` since it is no longer needed.",verify:({command:e,fs:t})=>a(e).toLowerCase().startsWith("rm ")?n(t,"/etc/myapp.conf.bak")?{ok:!1,message:"The backup is still there. Try `rm /etc/myapp.conf.bak`."}:{ok:!0,message:"Backup removed. Service recovered."}:{ok:!1,message:"Use `rm` to delete the backup."}}]},{id:"organize-the-mess",slug:"organize-the-mess",title:"Organize the mess",description:"A flat folder of log files needs to be sorted into `archive/` and `errors/`. Use the tools you know.",difficulty:"intermediate",order:2,seedVfs:e=>{let t=r(e,"/home/learner");if(!t)return;let s={type:"dir",children:{}};for(let e of(t.children.logs=s,[{name:"app-2024-01.log",content:"INFO boot\nINFO ready\n"},{name:"app-2024-02.log",content:"INFO boot\nERROR disk full\n"},{name:"app-2024-03.log",content:"INFO boot\nINFO ready\n"},{name:"app-2024-04.log",content:"INFO boot\nERROR oom\n"}]))s.children[e.name]={type:"file",content:e.content}},steps:[{title:"List the logs",prompt:"Use `ls /home/learner/logs` to see what is in there.",verify:({command:e,output:t})=>a(e).toLowerCase().startsWith("ls ")?/app-2024-/.test(t)?{ok:!0,message:"Found the log files."}:{ok:!1,message:"The listing did not look right. Try again."}:{ok:!1,message:"Try `ls /home/learner/logs`."}},{title:"Create the destination folders",prompt:"Create two directories inside `/home/learner/logs`: `archive` and `errors`.",verify:({command:e,fs:t})=>a(e).toLowerCase().startsWith("mkdir ")?o(t,"/home/learner/logs/archive")?o(t,"/home/learner/logs/errors")?{ok:!0,message:"Both directories created."}:{ok:!1,message:"Missing `errors/` directory."}:{ok:!1,message:"Missing `archive/` directory."}:{ok:!1,message:"Use `mkdir`."}},{title:"Find the error logs",prompt:'Find the log lines that contain the word "ERROR". Try `grep ERROR /home/learner/logs`.',verify:({command:e,output:t})=>a(e).toLowerCase().startsWith("grep ")?/ERROR/.test(t)?{ok:!0,message:"Found the error lines."}:{ok:!1,message:'Did not see "ERROR" in the output. Try a different pattern.'}:{ok:!1,message:"Try `grep ERROR /home/learner/logs`."}},{title:"Move the error logs into errors/",prompt:"Move `app-2024-02.log` and `app-2024-04.log` (the two error logs) into `/home/learner/logs/errors/`. You can issue two `mv` commands in one step separated by `&&`.",verify:({command:e,fs:t})=>a(e).toLowerCase().startsWith("mv ")?n(t,"/home/learner/logs/errors/app-2024-02.log")?n(t,"/home/learner/logs/errors/app-2024-04.log")?{ok:!0,message:"Files moved."}:{ok:!1,message:"app-2024-04.log is not in errors/ yet."}:{ok:!1,message:"app-2024-02.log is not in errors/. Try `mv /home/learner/logs/app-2024-02.log /home/learner/logs/errors/`."}:{ok:!1,message:"Use `mv` to move the files."}}]}];function l(e){return i.find(t=>t.slug===e)}function c(){return[...i].sort((e,t)=>e.order-t.order)}},6891:(e,t,s)=>{"use strict";s.d(t,{_M:()=>o,vn:()=>a});let r=[{id:"getting-started",slug:"getting-started",title:"Getting Started with Linux",description:"What Linux is, the shell, and your first commands.",difficulty:"beginner",order:1,trackCommand:"whoami",challenge:"Use a single command to print the word `linux` to the screen.",solution:"echo linux",content:`# Getting Started with Linux

**Linux** is a free, open-source operating system kernel that powers everything from phones to supercomputers. Most servers on the internet run Linux, and it is the single most important skill for anyone in DevOps, cloud, or backend development.

## What is the shell?

The **shell** is a program that takes commands from your keyboard and gives them to the operating system. The most common shell on Linux is called **bash**.

When you open a terminal, you see a *prompt* that ends with a dollar sign \`$\`. Everything you type after that prompt is a command.

## Your first commands

Try these in the terminal on the right:

\`\`\`bash
whoami          # show your current user
date            # show the current date and time
echo hello      # print "hello"
clear           # clear the screen
\`\`\`

> Lines that start with \`#\` are **comments**; the shell ignores them. They are just for you.

## Why learn the command line?

- Far faster than clicking through menus.
- Automatable; write a **script** once, run it forever.
- Works the same on a tiny VM or a giant cluster.

When you're ready, hit **Mark complete** and move to the next lesson.
`},{id:"filesystem-navigation",slug:"filesystem-navigation",title:"Filesystem Navigation",description:"Move around the filesystem with `pwd`, `ls`, and `cd`.",difficulty:"beginner",order:2,trackCommand:"ls",challenge:"From `/home/learner`, change into the `projects` directory.",solution:"cd projects",content:`# Filesystem Navigation

Linux organises everything under a single root directory \`/\`. Unlike Windows, there are no drive letters; everything branches off \`/\`.

## Three commands you will use constantly

| Command | What it does                  | Example         |
| ------- | ----------------------------- | --------------- |
| \`pwd\`   | Print current directory       | \`pwd\`          |
| \`ls\`    | List files in current dir     | \`ls -la\`       |
| \`cd\`    | Change directory              | \`cd /tmp\`      |

## Paths

- **Absolute paths** start at \`/\`, e.g. \`/home/learner\`.
- **Relative paths** start from where you are, e.g. \`../projects\`.

Special directory shortcuts:

- \`.\` - the current directory
- \`..\` - the parent directory
- \`~\` - your home directory

## Try it

\`\`\`bash
pwd                # shows something like /home/learner
ls                 # list contents
ls -la             # long format, including hidden files
cd /tmp            # jump to /tmp
pwd                # confirm you're now in /tmp
cd ~               # back home
\`\`\`
`},{id:"files-and-dirs",slug:"files-and-dirs",title:"Creating and Manipulating Files",description:"touch, mkdir, cp, mv, rm - the core file operations.",difficulty:"beginner",order:3,trackCommand:"mkdir",challenge:"Create a new directory called `lab` and then create an empty file `lab/notes.txt` inside it. Do it in two commands.",solution:"mkdir lab && touch lab/notes.txt",content:`# Creating and Manipulating Files

In this lesson you'll learn the everyday verbs for working with files and directories.

## Make

\`\`\`bash
mkdir projects          # create a directory
mkdir -p a/b/c          # create nested directories (-p = parents)
touch notes.txt         # create an empty file (or update timestamp)
\`\`\`

## Inspect

\`\`\`bash
cat notes.txt           # print file contents
less notes.txt          # page through a file (q to quit)
head -n 5 notes.txt     # first 5 lines
wc -l notes.txt         # count lines
\`\`\`

## Move / copy / delete

\`\`\`bash
cp notes.txt copy.txt        # copy
mv notes.txt renamed.txt     # rename / move
rm renamed.txt               # delete a file
rm -r projects               # delete a directory recursively
\`\`\`

> Warning: \`rm\` is **permanent**. There is no recycle bin. Triple-check before running \`rm -rf /\`.

## Edit

You'll often edit files straight from the terminal:

- \`nano notes.txt\` - beginner-friendly editor
- \`vim notes.txt\` - powerful but steep learning curve
`},{id:"users-and-permissions",slug:"users-and-permissions",title:"Users and Permissions",description:"Understand users, groups, and the chmod / chown commands.",difficulty:"intermediate",order:4,trackCommand:"chmod",challenge:"Make `script.sh` executable for the owner only (no permissions for group or others).",solution:"chmod 700 script.sh",content:`# Users and Permissions

Linux is a **multi-user** system. Every file belongs to a user and a group, and has three permission sets: **owner**, **group**, and **everyone else**.

## Reading permissions

Run \`ls -l\` and you will see something like:

\`\`\`
-rwxr-x---  1  alice  devs  1024  Jun 28  script.sh
\`\`\`

Breakdown:

- \`-\` - regular file (\`d\` for directory)
- \`rwx\` - owner can read, write, execute
- \`r-x\` - group can read and execute
- \`---\` - others have no access

## Changing permissions

\`\`\`bash
chmod 755 script.sh      # owner: rwx, group+other: rx
chmod +x script.sh       # add execute for everyone
chmod 600 secret.txt     # owner only
\`\`\`

The numbers are octal:

| Digit | r | w | x |
| ----- | - | - | - |
| 7     | yes | yes | yes |
| 6     | yes | yes |     |
| 5     | yes |     | yes |
| 4     | yes |     |     |

## Why this matters

Servers get hacked because files are too permissive. When in doubt, *least privilege* - grant only what is needed.
`},{id:"processes-and-system",slug:"processes-and-system",title:"Processes and the System",description:"ps, top, kill, and how to find what is running.",difficulty:"intermediate",order:5,trackCommand:"ps",challenge:"Show the top of the `ps aux` output filtered to lines containing the word `root`.",solution:"ps aux | grep root",content:`# Processes and the System

A **process** is a running program. Linux gives every process a numeric ID called a **PID**.

## Inspecting processes

\`\`\`bash
ps aux                 # snapshot of all processes
top                    # live, updating view (q to quit)
pgrep -a node          # find processes by name
\`\`\`

## Killing processes

\`\`\`bash
kill 1234              # polite shutdown (SIGTERM)
kill -9 1234           # force kill (SIGKILL) - last resort
pkill -f "python app"  # kill by pattern
\`\`\`

## System info

\`\`\`bash
uname -a               # kernel info
uptime                 # how long the system has been up
free -h                # memory usage
df -h                  # disk space
\`\`\`

## Foreground vs background

- Run normally: \`python app.py\` (foreground)
- Run in background: \`python app.py &\`
- Bring back to foreground: \`fg\`

These tools are your first stop when something is wrong on a server.
`}],n=[{id:"q-gs-1",lessonId:"getting-started",order:0,prompt:"Which command prints text to the screen?",answer:"echo"},{id:"q-gs-2",lessonId:"getting-started",order:1,prompt:"What does `whoami` tell you?",answer:"user"},{id:"q-fs-1",lessonId:"filesystem-navigation",order:0,prompt:"Which command prints the current working directory?",answer:"pwd"},{id:"q-fs-2",lessonId:"filesystem-navigation",order:1,prompt:'Which symbol means "your home directory"?',answer:"~"},{id:"q-fd-1",lessonId:"files-and-dirs",order:0,prompt:"What flag on `mkdir` creates nested directories?",answer:"-p"},{id:"q-fd-2",lessonId:"files-and-dirs",order:1,prompt:"Which command deletes an empty file?",answer:"rm"},{id:"q-up-1",lessonId:"users-and-permissions",order:0,prompt:"In `chmod 755`, what does the first digit control?",answer:"owner"},{id:"q-up-2",lessonId:"users-and-permissions",order:1,prompt:"True or false: `chmod +x` adds execute permission. (answer: true or false)",answer:"true"},{id:"q-ps-1",lessonId:"processes-and-system",order:0,prompt:"Which command shows a live, updating process list?",answer:"top"},{id:"q-ps-2",lessonId:"processes-and-system",order:1,prompt:"Which signal number forces a kill?",answer:"9"}];function o(){return[...r].sort((e,t)=>e.order-t.order)}function a(e){return n.filter(t=>t.lessonId===e).sort((e,t)=>e.order-t.order)}}};var t=require("../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[145,686],()=>s(9396));module.exports=r})();