exports.id=686,exports.ids=[686],exports.modules={6586:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,2994,23)),Promise.resolve().then(s.t.bind(s,6114,23)),Promise.resolve().then(s.t.bind(s,9727,23)),Promise.resolve().then(s.t.bind(s,9671,23)),Promise.resolve().then(s.t.bind(s,1868,23)),Promise.resolve().then(s.t.bind(s,4759,23))},1940:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,9404,23)),Promise.resolve().then(s.bind(s,1453)),Promise.resolve().then(s.bind(s,2004)),Promise.resolve().then(s.bind(s,5901)),Promise.resolve().then(s.bind(s,4233)),Promise.resolve().then(s.bind(s,3173))},9146:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,9404,23))},5303:()=>{},1453:(e,t,s)=>{"use strict";s.d(t,{CommandPalette:()=>d});var r=s(326),n=s(5047),a=s(7577),i=s(8539),l=s(3597);let o=[{id:"getting-started",slug:"getting-started",title:"Getting Started with Linux",description:"What Linux is, the shell, and your first commands.",difficulty:"beginner",order:1,trackCommand:"whoami",challenge:"Use a single command to print the word `linux` to the screen.",solution:"echo linux",content:`# Getting Started with Linux

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
`}],c=[{title:"Home",description:"Back to the landing page",group:"Navigate",href:"/",icon:r.jsx(i.LZ,{size:14}),keywords:["home","landing"]},{title:"All lessons",description:"Browse the full lesson catalogue",group:"Navigate",href:"/lessons",icon:r.jsx(i.vJ,{size:14}),keywords:["lessons","catalogue","list"]},{title:"Cheatsheet",description:"Searchable command reference",group:"Navigate",href:"/cheatsheet",icon:r.jsx(i.Fx,{size:14}),keywords:["cheatsheet","commands","reference","shell"]},{title:"Boss levels",description:"Multi-step challenges",group:"Navigate",href:"/boss",icon:r.jsx(i.Fx,{size:14}),keywords:["boss","challenge","hard"]}];function d(){let[e,t]=(0,a.useState)(!1),[s,d]=(0,a.useState)(""),[x,m]=(0,a.useState)(0),p=(0,a.useRef)(null),u=(0,a.useRef)(null),g=(0,n.useRouter)(),v="undefined"!=typeof navigator&&/Mac|iPhone|iPad|iPod/i.test(navigator.platform||navigator.userAgent),f=(0,a.useMemo)(()=>{let e=[...o].sort((e,t)=>e.order-t.order).map(e=>({id:`lesson:${e.id}`,title:e.title,description:e.description,group:"Lesson",href:`/lessons/${e.slug}`,keywords:[e.id,e.slug,e.title,e.description,e.trackCommand??"",e.difficulty],icon:r.jsx(i.vJ,{size:14})}));return[...c.map((e,t)=>({id:`nav:${t}`,...e})),...e]},[]),b=(0,a.useMemo)(()=>{let e=s.trim().toLowerCase();return e?f.map(t=>{let s=[t.title,t.description??"",t.group,...t.keywords??[]].join(" ").toLowerCase().indexOf(e);return{item:t,score:-1===s?Number.POSITIVE_INFINITY:s}}).filter(e=>Number.isFinite(e.score)).sort((e,t)=>e.score-t.score).slice(0,30).map(e=>e.item):f.slice(0,12)},[f,s]),j=(0,a.useCallback)(e=>{e.onSelect?e.onSelect():e.href&&g.push(e.href),t(!1)},[g]);function y(){requestAnimationFrame(()=>{let e=u.current?.querySelector(`[data-idx="${x}"]`);e?.scrollIntoView({block:"nearest"})})}return(0,r.jsxs)(r.Fragment,{children:[r.jsx(h,{onClick:()=>t(!0),mac:v}),e&&(0,r.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Command palette",className:"fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]",children:[r.jsx("div",{className:"absolute inset-0 bg-slate-950/70 backdrop-blur-sm",onClick:()=>t(!1),"aria-hidden":!0}),(0,r.jsxs)("div",{className:"lx-card relative z-10 w-full max-w-xl overflow-hidden border-[var(--lx-border-strong)]/70 shadow-2xl",children:[(0,r.jsxs)("div",{className:"flex items-center gap-2 border-b border-[var(--lx-border)] px-4 py-3",children:[r.jsx(i.W1,{size:16,className:"text-slate-500"}),r.jsx("input",{ref:p,value:s,onChange:e=>d(e.target.value),onKeyDown:function(e){if("ArrowDown"===e.key)e.preventDefault(),m(e=>Math.min(b.length-1,e+1)),y();else if("ArrowUp"===e.key)e.preventDefault(),m(e=>Math.max(0,e-1)),y();else if("Enter"===e.key){e.preventDefault();let t=b[x];t&&j(t)}},placeholder:"Search lessons, jump to a page…",className:"flex-1 bg-transparent text-sm text-[var(--lx-fg)] outline-none placeholder:text-slate-500","aria-label":"Search"}),r.jsx("span",{className:"lx-kbd",children:"esc"})]}),0===b.length?(0,r.jsxs)("div",{className:"px-4 py-10 text-center text-sm text-slate-500",children:["No results for “",s,"”"]}):r.jsx("ul",{ref:u,role:"listbox",className:"max-h-[55vh] overflow-y-auto p-1",children:function(e,t,s,n){let a=[];e.forEach((e,t)=>{let s=a[a.length-1];s&&s.group===e.group?s.items.push(e):a.push({group:e.group,items:[e],startIdx:t})});let i=0;return a.map(e=>(0,r.jsxs)("li",{className:"px-1 pb-1 pt-2 first:pt-1",children:[r.jsx("div",{className:"px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500",children:e.group}),r.jsx("ul",{children:e.items.map(e=>{let a=i===t,o=i;return i+=1,r.jsx("li",{"data-idx":o,children:(0,r.jsxs)("button",{type:"button",role:"option","aria-selected":a,onMouseEnter:()=>n(o),onClick:()=>s(e),className:`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${a?"bg-[var(--lx-accent-glow)] text-[var(--lx-fg)]":"text-slate-300 hover:bg-slate-800/40"}`,children:[r.jsx("span",{className:`flex h-7 w-7 items-center justify-center rounded-md border ${a?"border-[var(--lx-accent)]/50 text-[var(--lx-accent)]":"border-slate-800 text-slate-500"}`,"aria-hidden":!0,children:e.icon}),(0,r.jsxs)("span",{className:"min-w-0 flex-1",children:[r.jsx("span",{className:"block truncate font-medium",children:e.title}),e.description&&r.jsx("span",{className:"block truncate text-xs text-slate-500",children:e.description})]}),e.href&&r.jsx(l.DR,{tone:"default",className:"!text-[0.6rem]",children:e.href})]})},e.id)})})]},e.group))}(b,x,j,m)}),(0,r.jsxs)("div",{className:"flex items-center justify-between border-t border-[var(--lx-border)] bg-[var(--lx-bg-elevated)]/60 px-4 py-2 text-xs text-slate-500",children:[(0,r.jsxs)("span",{className:"flex items-center gap-2",children:[r.jsx(i.RQ,{size:12})," ",v?"⌘":"Ctrl"," + K"]}),(0,r.jsxs)("span",{children:[r.jsx("span",{className:"lx-kbd",children:"↑"})," ",r.jsx("span",{className:"lx-kbd",children:"↓"})," to navigate \xb7 ",r.jsx("span",{className:"lx-kbd",children:"↵"})," to open"]})]})]})]})]})}function h({onClick:e,mac:t}){return(0,r.jsxs)("button",{type:"button",onClick:e,"aria-label":"Open command palette",className:"flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]",children:[r.jsx(i.W1,{size:12}),r.jsx("span",{className:"hidden sm:inline",children:"Search"}),(0,r.jsxs)("span",{className:"hidden items-center gap-0.5 sm:flex",children:[r.jsx("span",{className:"lx-kbd",children:t?"⌘":"Ctrl"}),r.jsx("span",{className:"lx-kbd",children:"K"})]})]})}},2004:(e,t,s)=>{"use strict";s.d(t,{KeyboardShortcuts:()=>n}),s(7577);var r=s(5047);function n(){return(0,r.useRouter)(),null}},5901:(e,t,s)=>{"use strict";s.d(t,{ResetProgressButton:()=>l});var r=s(326),n=s(7577),a=s(3173),i=s(8539);function l(){let{reset:e}=(0,a.S)(),[t,s]=(0,n.useState)(!1),[l,o]=(0,n.useTransition)();return t?(0,r.jsxs)("div",{className:"flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs",children:[r.jsx("span",{className:"text-amber-200",children:"Erase all progress?"}),r.jsx("button",{onClick:function(){o(()=>{e(),s(!1)})},disabled:l,className:"rounded bg-amber-400/90 px-2 py-0.5 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-50",children:l?"…":"Yes"}),r.jsx("button",{onClick:()=>s(!1),disabled:l,className:"rounded px-2 py-0.5 text-slate-300 hover:bg-slate-800",children:"Cancel"})]}):(0,r.jsxs)("button",{onClick:()=>s(!0),className:"lx-btn lx-btn-ghost lx-btn-sm text-slate-400",title:"Reset all progress on this browser",children:[r.jsx(i.X5,{size:14})," Reset"]})}},4233:(e,t,s)=>{"use strict";s.d(t,{ThemeToggle:()=>i});var r=s(326),n=s(7577),a=s(8539);function i(){let[e,t]=(0,n.useState)("dark"),[s,i]=(0,n.useState)(!1),l=s&&"light"===e?"Switch to dark theme":"Switch to light theme";return r.jsx("button",{type:"button",onClick:function(){let s="dark"===e?"light":"dark";t(s),document.documentElement.classList.toggle("light","light"===s);try{window.localStorage.setItem("learninx_theme",s)}catch{}},"aria-label":l,title:l,className:"rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800/60 hover:text-[var(--lx-accent)]",children:s&&"light"===e?r.jsx(a.kL,{size:16}):r.jsx(a.NW,{size:16})})}},8539:(e,t,s)=>{"use strict";s.d(t,{DE:()=>M,Fx:()=>a,LZ:()=>c,NW:()=>f,PH:()=>m,RQ:()=>k,T$:()=>g,TI:()=>x,Tw:()=>u,W1:()=>v,WG:()=>y,X5:()=>p,Yq:()=>j,cK:()=>w,cv:()=>h,jr:()=>d,k1:()=>L,kL:()=>b,nQ:()=>l,r7:()=>N,vJ:()=>i,wy:()=>o});var r=s(326);s(7577);let n=e=>({width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,focusable:!1,suppressHydrationWarning:!0}),a=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"m4 17 6-6-6-6"}),r.jsx("path",{d:"M12 19h8"})]}),i=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"}),r.jsx("path",{d:"M4 5.5V19.5"})]}),l=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M20 6 9 17l-5-5"})}),o=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"m15 18-6-6 6-6"})}),c=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M5 12h14M13 5l7 7-7 7"})}),d=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M13 2 3 14h8l-1 8 10-12h-8z"})}),h=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22 2.5 2.5 0 0 1 7 19.5a2.5 2.5 0 0 1-2.96-3.08 2.5 2.5 0 0 1-1.32-4.24 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 7 4.5 2.5 2.5 0 0 1 9.5 2z"}),r.jsx("path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0 2.96-3.08 2.5 2.5 0 0 0 1.32-4.24 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 17 4.5 2.5 2.5 0 0 0 14.5 2z"})]}),x=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("rect",{x:"9",y:"9",width:"13",height:"13",rx:"2"}),r.jsx("path",{d:"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"})]}),m=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"M2 12 7 17 18 6"}),r.jsx("path",{d:"M22 6 12 16l-3-3"})]}),p=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"M3 12a9 9 0 1 0 3-6.7L3 8"}),r.jsx("path",{d:"M3 3v5h5"})]}),u=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M18 6 6 18M6 6l12 12"})}),g=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"m12 3-1.9 5.8L4 10.5l5.5 1.7L12 18l2.5-5.8 5.5-1.7-6.1-1.7z"}),r.jsx("path",{d:"M5 3v4M3 5h4M19 17v4M17 19h4"})]}),v=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("circle",{cx:"11",cy:"11",r:"7"}),r.jsx("path",{d:"m20 20-3.5-3.5"})]}),f=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("circle",{cx:"12",cy:"12",r:"4"}),r.jsx("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"})]}),b=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})}),j=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3-2 1-4 3-4 6a8 8 0 0 0 16 0c0-6-9-11-9-11z"})}),y=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.4 1 2.3v1h6v-1c0-.9.3-1.7 1-2.3A7 7 0 0 0 12 2z"})}),w=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("circle",{cx:"12",cy:"12",r:"10"}),r.jsx("circle",{cx:"12",cy:"12",r:"6"}),r.jsx("circle",{cx:"12",cy:"12",r:"2"})]}),k=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"})}),N=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"})}),M=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"})}),L=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M3 6h18M6 12h12M10 18h4"})})},3597:(e,t,s)=>{"use strict";s.d(t,{DR:()=>n,ko:()=>a});var r=s(326);function n({children:e,tone:t="default",className:s=""}){return r.jsx("span",{className:`lx-pill ${"success"===t?"lx-pill-success":"accent"===t?"lx-pill-accent":"beginner"===t?"lx-pill-beginner":"intermediate"===t?"lx-pill-intermediate":"advanced"===t?"lx-pill-advanced":""} ${s}`,children:e})}function a({value:e,max:t,label:s}){let n=0===t?0:Math.max(0,Math.min(100,e/t*100));return(0,r.jsxs)("div",{className:"space-y-1.5",children:[s&&(0,r.jsxs)("div",{className:"flex justify-between text-xs text-slate-400",children:[r.jsx("span",{children:s}),(0,r.jsxs)("span",{className:"font-mono text-slate-300",children:[e,"/",t]})]}),r.jsx("div",{className:"lx-progress",role:"progressbar","aria-valuenow":e,"aria-valuemin":0,"aria-valuemax":t,"aria-label":s,children:r.jsx("div",{className:"lx-progress-bar",style:{width:`${n}%`}})})]})}s(7577)},3173:(e,t,s)=>{"use strict";s.d(t,{ProgressProvider:()=>x,S:()=>m});var r=s(326),n=s(7577);let a={v:1,completed:[],quiz:{},streak:{current:0,best:0,lastActiveDay:null,totalCompletions:0,totalCorrect:0,points:0},lastTipDay:null};function i(e){return"function"==typeof structuredClone?structuredClone(e):JSON.parse(JSON.stringify(e))}function l(e=new Date){return e.toISOString().slice(0,10)}function o(e){let t=i(a),s=t.completed.includes(e);s||t.completed.push(e);let r=l(),n=function(e,t){if(e.lastActiveDay===t)return e;if(e.lastActiveDay&&1===function(e,t){let s=Date.UTC(Number(e.slice(0,4)),Number(e.slice(5,7))-1,Number(e.slice(8,10)));return Math.round((Date.UTC(Number(t.slice(0,4)),Number(t.slice(5,7))-1,Number(t.slice(8,10)))-s)/864e5)}(e.lastActiveDay,t)){let s=e.current+1;return{...e,current:s,best:Math.max(e.best,s),lastActiveDay:t}}return{...e,current:1,best:Math.max(e.best,1),lastActiveDay:t}}(t.streak,r);return s||(n.totalCompletions+=1,n.points+=10),{...t,streak:n}}function c(e){return e.replace(/\s+/g," ").trim().toLowerCase().replace(/[.;!?]$/g,"")}function d(e){return e.replace(/\s+/g," ").trim().toLowerCase().replace(/;$/,"")}let h=(0,n.createContext)(null);function x({children:e}){let[t,s]=(0,n.useState)({v:1,completed:[],quiz:{},streak:{current:0,best:0,lastActiveDay:null,totalCompletions:0,totalCorrect:0,points:0},lastTipDay:null}),[x,m]=(0,n.useState)(!1),p=(0,n.useMemo)(()=>new Set(t.completed),[t.completed]),u=(0,n.useCallback)(e=>t.completed.includes(e),[t.completed]),g=(0,n.useCallback)(e=>{s(o(e))},[]),v=(0,n.useCallback)(()=>{s(i(a))},[]),f=(0,n.useCallback)(()=>{s(function(){let e=i(a),t=l();return e.lastTipDay===t?e:{...e,lastTipDay:t}}())},[]),b=(0,n.useCallback)((e,t,r)=>t?d(t).split("||").map(e=>e.trim()).includes(d(r))?(s(o(e)),{ok:!0,message:"Nice work — that is the expected command."}):{ok:!1,message:"Not quite — try again, or peek at the hint in the sandbox."}:{ok:!1,message:"This lesson has no challenge."},[]),j=(0,n.useCallback)((e,t,r)=>{if(0===t.length)return s(o(e)),{results:[],correct:0,total:0,score:0,passed:!0};let n=0,l=t.map(e=>{let t=r.find(t=>t.questionId===e.id)?.answer??"",s=c(t)===c(e.answer);return s&&(n+=1),{questionId:e.id,prompt:e.prompt,given:t,expected:e.answer,correct:s}}),d=t.length,h=Math.round(n/d*100),x=h>=80,m=function(e,t){let s=i(a),r=s.quiz[e];s.quiz[e]=t;let n=r?.correct??0,l=Math.max(0,t.correct-n);if(l>0){let e={...s.streak,totalCorrect:s.streak.totalCorrect+l};return e.points+=l,{...s,streak:e}}return s}(e,{score:h,correct:n,total:d,at:Date.now()});return x&&(m=o(e)),s(m),{results:l,correct:n,total:d,score:h,passed:x}},[]),y=(0,n.useMemo)(()=>({state:t,ready:x,isCompleted:u,completedSet:p,markComplete:g,reset:v,markTipSeen:f,submitChallenge:b,submitQuiz:j}),[t,x,u,p,g,v,f,b,j]);return r.jsx(h.Provider,{value:y,children:e})}function m(){let e=(0,n.useContext)(h);if(!e)throw Error("useProgress must be used inside <ProgressProvider>.");return e}},6782:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>p,metadata:()=>x,viewport:()=>m});var r=s(9510),n=s(7371),a=s(631),i=s(8570);let l=(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\components\ResetProgressButton.tsx#ResetProgressButton`),o=(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\components\KeyboardShortcuts.tsx#KeyboardShortcuts`),c=(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\components\CommandPalette.tsx#CommandPalette`);(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\components\CommandPalette.tsx#openPaletteButtonProps`);let d=(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\components\ThemeToggle.tsx#ThemeToggle`),h=(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\lib\progress-context.tsx#ProgressProvider`);(0,i.createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\lib\progress-context.tsx#useProgress`),s(5023);let x={title:"Learninx — Learn Linux the Easy Way",description:"An interactive Linux learning platform with in-browser terminal, lessons, and quizzes. No signup required.",icons:{icon:"/favicon.svg"}},m={width:"device-width",initialScale:1,themeColor:"#0b0f12"};function p({children:e}){return(0,r.jsxs)("html",{lang:"en",suppressHydrationWarning:!0,children:[r.jsx("head",{children:r.jsx("script",{dangerouslySetInnerHTML:{__html:"(function(){try{var t=localStorage.getItem('learninx_theme');if(!t){t=matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();"}})}),(0,r.jsxs)("body",{suppressHydrationWarning:!0,children:[r.jsx("a",{href:"#main",className:"lx-skip-link",children:"Skip to content"}),(0,r.jsxs)(h,{children:[r.jsx(o,{}),r.jsx(c,{}),r.jsx("header",{className:"sticky top-0 z-30 border-b border-[var(--lx-border)] bg-[var(--lx-nav-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--lx-nav-bg)]",children:(0,r.jsxs)("nav",{"aria-label":"Primary",className:"mx-auto flex max-w-6xl items-center justify-between px-4 py-3",children:[(0,r.jsxs)(n.default,{href:"/",className:"group flex items-center gap-2 font-semibold text-lg",children:[r.jsx("span",{"aria-hidden":!0,className:"font-mono text-[var(--lx-accent)] transition-transform group-hover:translate-x-0.5",children:"~$"}),(0,r.jsxs)("span",{children:["learn",r.jsx("span",{className:"text-[var(--lx-accent)]",children:"inx"})]})]}),(0,r.jsxs)("div",{className:"flex items-center gap-1 text-sm sm:gap-2",children:[(0,r.jsxs)(n.default,{href:"/lessons",className:"rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)]",children:[r.jsx("span",{className:"hidden sm:inline",children:"Lessons"}),r.jsx(a.Fx,{size:16,className:"sm:hidden"})]}),r.jsx(n.default,{href:"/cheatsheet",className:"hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-block",children:"Cheatsheet"}),r.jsx(d,{}),(0,r.jsxs)("a",{href:"https://github.com/raveendra11/Learninx",target:"_blank",rel:"noreferrer",className:"hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-flex",children:[r.jsx(a.ET,{size:14})," GitHub"]}),r.jsx("div",{className:"hidden md:block",children:r.jsx(l,{})})]})]})}),r.jsx("main",{id:"main",className:"mx-auto w-full max-w-6xl px-4 py-8 md:py-10",children:e}),(0,r.jsxs)("footer",{className:"mx-auto mt-12 max-w-6xl px-4 py-8 text-center text-xs text-slate-500",children:[r.jsx("p",{children:"Built for learning Linux \xb7 open source \xb7 no signup, no tracking"}),(0,r.jsxs)("p",{className:"mt-1 text-slate-600",children:["Press ",r.jsx("span",{className:"lx-kbd",children:"g"})," then"," ",r.jsx("span",{className:"lx-kbd",children:"l"})," to jump to lessons"]})]})]})]})]})}},1930:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>a});var r=s(9510),n=s(631);function a(){return(0,r.jsxs)("div",{className:"flex flex-col items-center justify-center gap-3 py-24 text-slate-400",children:[(0,r.jsxs)("div",{className:"flex items-center gap-1 font-mono text-sm",children:[r.jsx("span",{className:"text-[var(--lx-accent)]",children:"~"}),r.jsx("span",{className:"text-slate-500",children:"$"}),(0,r.jsxs)("span",{className:"ml-2 inline-flex",children:[r.jsx("span",{className:"animate-pulse",children:"."}),r.jsx("span",{className:"animate-pulse [animation-delay:120ms]",children:"."}),r.jsx("span",{className:"animate-pulse [animation-delay:240ms]",children:"."})]})]}),(0,r.jsxs)("p",{className:"flex items-center gap-1.5 text-xs text-slate-500",children:[r.jsx(n.Fx,{size:12})," Booting the sandbox"]})]})}},2523:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>i});var r=s(9510),n=s(7371),a=s(631);function i(){return(0,r.jsxs)("div",{className:"mx-auto max-w-xl py-16 text-center",children:[(0,r.jsxs)("div",{className:"mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]",children:[r.jsx(a.Fx,{size:12})," 404"]}),r.jsx("h1",{className:"text-4xl font-bold tracking-tight sm:text-5xl",children:"No such command."}),r.jsx("p",{className:"mx-auto mt-3 max-w-md text-slate-400",children:"We could not find that page. The link might be stale, or the lesson may have been renamed."}),(0,r.jsxs)("div",{className:"mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row",children:[(0,r.jsxs)(n.default,{href:"/lessons",className:"lx-btn lx-btn-primary",children:["Browse lessons ",r.jsx(a.LZ,{size:14})]}),r.jsx(n.default,{href:"/",className:"lx-btn lx-btn-secondary",children:"Back home"})]}),r.jsx("pre",{className:"mt-10 inline-block rounded-md border border-slate-800 bg-slate-950/80 px-4 py-3 text-left font-mono text-xs text-slate-400",children:`$ open {path}
bash: {path}: No such file or directory`})]})}},631:(e,t,s)=>{"use strict";s.d(t,{ET:()=>d,Fx:()=>a,LZ:()=>c,T$:()=>h,WG:()=>x,cK:()=>m,rc:()=>l,rm:()=>o,vJ:()=>i});var r=s(9510);s(1159);let n=e=>({width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,focusable:!1,suppressHydrationWarning:!0}),a=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"m4 17 6-6-6-6"}),r.jsx("path",{d:"M12 19h8"})]}),i=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"}),r.jsx("path",{d:"M4 5.5V19.5"})]}),l=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("rect",{x:"2",y:"4",width:"20",height:"13",rx:"2"}),r.jsx("path",{d:"M8 21h8M12 17v4"})]}),o=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"M8 21h8M12 17v4"}),r.jsx("path",{d:"M7 4h10v5a5 5 0 0 1-10 0V4z"}),r.jsx("path",{d:"M17 5h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4M7 5H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4"})]}),c=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M5 12h14M13 5l7 7-7 7"})}),d=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"})}),h=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("path",{d:"m12 3-1.9 5.8L4 10.5l5.5 1.7L12 18l2.5-5.8 5.5-1.7-6.1-1.7z"}),r.jsx("path",{d:"M5 3v4M3 5h4M19 17v4M17 19h4"})]}),x=({size:e=16,...t})=>r.jsx("svg",{...n(e),...t,children:r.jsx("path",{d:"M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.4 1 2.3v1h6v-1c0-.9.3-1.7 1-2.3A7 7 0 0 0 12 2z"})}),m=({size:e=16,...t})=>(0,r.jsxs)("svg",{...n(e),...t,children:[r.jsx("circle",{cx:"12",cy:"12",r:"10"}),r.jsx("circle",{cx:"12",cy:"12",r:"6"}),r.jsx("circle",{cx:"12",cy:"12",r:"2"})]})},5023:()=>{}};