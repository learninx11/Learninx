(()=>{var e={};e.id=649,e.ids=[649],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},8970:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>i.a,__next_app__:()=>p,originalPathname:()=>m,pages:()=>c,routeModule:()=>h,tree:()=>d}),s(8735),s(6782),s(1930),s(2523);var r=s(3191),n=s(8716),a=s(7922),i=s.n(a),o=s(5231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);s.d(t,l);let d=["",{children:["lessons",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,8735)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\lessons\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,6782)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\layout.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,1930)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\loading.tsx"],"not-found":[()=>Promise.resolve().then(s.bind(s,2523)),"D:\\OSPs\\Learninx\\Learninx\\src\\app\\not-found.tsx"]}],c=["D:\\OSPs\\Learninx\\Learninx\\src\\app\\lessons\\page.tsx"],m="/lessons/page",p={require:s,loadChunk:()=>Promise.resolve()},h=new r.AppPageRouteModule({definition:{kind:n.x.APP_PAGE,page:"/lessons/page",pathname:"/lessons",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},9479:(e,t,s)=>{Promise.resolve().then(s.bind(s,4894))},434:(e,t,s)=>{"use strict";s.d(t,{default:()=>n.a});var r=s(9404),n=s.n(r)},4894:(e,t,s)=>{"use strict";s.d(t,{LessonsIndexClient:()=>p});var r=s(326),n=s(434),a=s(7577),i=s(8539),o=s(3597),l=s(893),d=s(3173);let c=["beginner","intermediate","advanced"],m={beginner:"Beginner",intermediate:"Intermediate",advanced:"Advanced"};function p({lessons:e}){let{completedSet:t,state:s,ready:n}=(0,d.S)(),[p,u]=(0,a.useState)(""),[g,f]=(0,a.useState)("all"),[v,y]=(0,a.useState)("all"),b=(0,a.useRef)(null),j=(0,a.useMemo)(()=>e.map(e=>({...e,completed:t.has(e.id)})),[e,t]),w=(0,a.useMemo)(()=>{let e=p.trim().toLowerCase();return j.filter(t=>("all"===g||t.difficulty===g)&&("completed"!==v||!!t.completed)&&("todo"!==v||!t.completed)&&(!e||!![t.title,t.description,t.id,t.slug,t.trackCommand??"",t.difficulty,t.content.slice(0,200)].join(" ").toLowerCase().includes(e)))},[j,p,g,v]),k=(0,a.useMemo)(()=>c.map(e=>({difficulty:e,items:w.filter(t=>t.difficulty===e).sort((e,t)=>e.order-t.order)})).filter(e=>e.items.length>0),[w]),N=j.filter(e=>e.completed).length,C=Object.keys(s.quiz).length,L=n?N:0,P=n?C:0,q=w.length,S=p||"all"!==g||"all"!==v;return(0,r.jsxs)("div",{className:"space-y-10",children:[(0,r.jsxs)("header",{className:"space-y-4",children:[(0,r.jsxs)(o.DR,{tone:"accent",children:[r.jsx(i.Fx,{size:12})," ~/lessons"]}),r.jsx("h1",{className:"text-3xl font-bold tracking-tight sm:text-4xl",children:"Lessons"}),r.jsx("p",{className:"max-w-2xl text-[var(--lx-muted)]",children:"Work through the chapters in order. Each lesson ends with a small challenge. Your progress is saved on this browser."}),(0,r.jsxs)("div",{className:"grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end",children:[r.jsx(o.ko,{value:L,max:e.length,label:"Overall progress"}),(0,r.jsxs)("div",{className:"text-sm text-[var(--lx-muted)] sm:text-right",children:[(0,r.jsxs)("div",{className:"font-mono text-base text-[var(--lx-fg)]",children:[L,(0,r.jsxs)("span",{className:"text-[var(--lx-muted)]",children:[" / ",e.length]})]}),(0,r.jsxs)("div",{className:"text-xs text-[var(--lx-muted)]",children:[P," quiz attempt",1===P?"":"s"]})]})]}),r.jsx(l.StreakWidget,{variant:"inline"})]}),(0,r.jsxs)("section",{className:"lx-card flex flex-col gap-3 p-4 sm:p-5",children:[(0,r.jsxs)("div",{className:"relative",children:[r.jsx("span",{className:"pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lx-muted)]","aria-hidden":!0,children:r.jsx(i.W1,{size:16})}),r.jsx("input",{ref:b,value:p,onChange:e=>u(e.target.value),placeholder:"Search lessons (press / )",className:"lx-input pl-9","aria-label":"Search lessons"})]}),(0,r.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,r.jsxs)("span",{className:"flex items-center gap-1.5 text-xs text-[var(--lx-muted)]",children:[r.jsx(i.k1,{size:12})," Difficulty"]}),r.jsx(h,{label:"All",active:"all"===g,onClick:()=>f("all")}),c.map(e=>r.jsx(h,{label:m[e],active:g===e,onClick:()=>f(e)},e)),r.jsx("span",{className:"mx-2 hidden h-4 w-px bg-[var(--lx-border)] sm:inline"}),r.jsx(h,{label:"All status",active:"all"===v,onClick:()=>y("all")}),r.jsx(h,{label:"To do",active:"todo"===v,onClick:()=>y("todo")}),r.jsx(h,{label:"Completed",active:"completed"===v,onClick:()=>y("completed")})]}),S&&(0,r.jsxs)("p",{className:"text-xs text-[var(--lx-muted)]",children:["Showing ",q," of ",e.length," lessons",p?` matching “${p}”`:"","all"!==g?` in ${m[g]}`:"","all"!==v?` \xb7 ${"completed"===v?"completed":"to do"}`:""," \xb7 ",r.jsx("button",{type:"button",onClick:()=>{u(""),f("all"),y("all")},className:"text-[var(--lx-accent)] hover:underline",children:"reset"})]})]}),0===k.length?r.jsx("div",{className:"lx-card p-10 text-center text-sm text-[var(--lx-muted)]",children:"No lessons match the current filter."}):r.jsx("div",{className:"space-y-10",children:k.map(e=>(0,r.jsxs)("section",{className:"space-y-3",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3",children:[r.jsx(o.DR,{tone:e.difficulty,children:m[e.difficulty]}),(0,r.jsxs)("span",{className:"text-xs text-[var(--lx-muted)]",children:[e.items.filter(e=>e.completed).length,"/",e.items.length," complete"]})]}),r.jsx("ul",{className:"space-y-3",children:e.items.map(e=>r.jsx(x,{lesson:e,query:p.trim().toLowerCase()},e.id))})]},e.difficulty))})]})}function h({label:e,active:t,onClick:s}){return r.jsx("button",{type:"button",onClick:s,className:`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${t?"border-[var(--lx-accent)] bg-[var(--lx-accent-glow)] text-[var(--lx-accent)]":"border-[var(--lx-border)] text-[var(--lx-muted)] hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]"}`,children:e})}function x({lesson:e,query:t}){return r.jsx("li",{children:(0,r.jsxs)(n.default,{href:`/lessons/${e.slug}`,className:"lx-card lx-card-interactive group flex items-center gap-4 p-4 sm:p-5","aria-label":`Open lesson: ${e.title}${e.completed?" (completed)":""}`,children:[r.jsx("span",{className:`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-mono font-semibold transition ${e.completed?"border-[var(--lx-success)]/40 bg-[var(--lx-success)]/10 text-[var(--lx-success)]":"border-[var(--lx-border)] bg-slate-900/40 text-[var(--lx-muted)] group-hover:border-[var(--lx-accent)]/40 group-hover:text-[var(--lx-accent)]"}`,"aria-hidden":!0,children:e.completed?r.jsx(i.nQ,{size:18}):e.order}),(0,r.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,r.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[r.jsx("h2",{className:"truncate font-semibold text-[var(--lx-fg)]",children:r.jsx(u,{text:e.title,query:t})}),e.completed&&r.jsx(o.DR,{tone:"success",children:"Completed"})]}),r.jsx("p",{className:"mt-0.5 line-clamp-2 text-sm text-[var(--lx-muted)]",children:r.jsx(u,{text:e.description,query:t})})]}),r.jsx(i.LZ,{size:18,className:"shrink-0 text-[var(--lx-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--lx-accent)]"})]})})}function u({text:e,query:t}){if(!t)return r.jsx(r.Fragment,{children:e});let s=e.toLowerCase().indexOf(t);return -1===s?r.jsx(r.Fragment,{children:e}):(0,r.jsxs)(r.Fragment,{children:[e.slice(0,s),r.jsx("mark",{className:"rounded bg-[var(--lx-accent)]/30 px-0.5 text-[var(--lx-fg)]",children:e.slice(s,s+t.length)}),e.slice(s+t.length)]})}},893:(e,t,s)=>{"use strict";s.d(t,{StreakWidget:()=>o});var r=s(326),n=s(8539),a=s(3597),i=s(3173);function o({variant:e="card"}){let{state:t,ready:s}=(0,i.S)(),o=t.streak,d=s?o:{current:0,best:0,lastActiveDay:null,totalCompletions:0,totalCorrect:0,points:0};return"inline"===e?(0,r.jsxs)("div",{className:"flex flex-wrap items-center gap-2 text-xs",children:[(0,r.jsxs)(a.DR,{tone:"accent",children:[r.jsx(n.Yq,{size:10})," ",d.current,"-day streak"]}),(0,r.jsxs)(a.DR,{tone:"default",children:[r.jsx(n.r7,{size:10})," ",d.points," pts"]}),(0,r.jsxs)(a.DR,{tone:"default",children:[r.jsx(n.cK,{size:10})," ",d.totalCompletions," done"]})]}):(0,r.jsxs)("div",{className:"lx-card p-5 sm:p-6",children:[r.jsx("div",{className:"flex items-center gap-2",children:(0,r.jsxs)(a.DR,{tone:"accent",children:[r.jsx(n.Yq,{size:12})," Streak"]})}),(0,r.jsxs)("div",{className:"mt-3 flex items-baseline gap-2",children:[r.jsx("span",{className:"font-mono text-4xl font-bold text-[var(--lx-accent)]",children:d.current}),(0,r.jsxs)("span",{className:"text-sm text-[var(--lx-muted)]",children:["day",1===d.current?"":"s"," in a row"]})]}),(0,r.jsxs)("p",{className:"mt-1 text-xs text-[var(--lx-muted)]",children:["Best streak so far: ",d.best," day",1===d.best?"":"s","."]}),(0,r.jsxs)("div",{className:"mt-4 grid grid-cols-3 gap-2 text-center text-xs",children:[r.jsx(l,{label:"Points",value:d.points}),r.jsx(l,{label:"Lessons",value:d.totalCompletions}),r.jsx(l,{label:"Correct",value:d.totalCorrect})]}),r.jsx("p",{className:"mt-3 text-[0.65rem] text-[var(--lx-muted)]",children:"+10 points per lesson, +1 per correct quiz answer. Missing a day resets the streak to 1."})]})}function l({label:e,value:t}){return(0,r.jsxs)("div",{className:"rounded-md border border-[var(--lx-border)] bg-[var(--lx-bg-elevated)]/40 px-2 py-2",children:[r.jsx("div",{className:"font-mono text-base font-semibold text-[var(--lx-fg)]",children:t}),r.jsx("div",{className:"text-[0.6rem] uppercase tracking-wider text-[var(--lx-muted)]",children:e})]})}},8735:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>i});var r=s(9510),n=s(6891);let a=(0,s(8570).createProxy)(String.raw`D:\OSPs\Learninx\Learninx\src\app\lessons\_lessons-index-client.tsx#LessonsIndexClient`);function i(){let e=(0,n._M)();return r.jsx(a,{lessons:e})}},6891:(e,t,s)=>{"use strict";s.d(t,{_M:()=>a,vn:()=>i});let r=[{id:"getting-started",slug:"getting-started",title:"Getting Started with Linux",description:"What Linux is, the shell, and your first commands.",difficulty:"beginner",order:1,trackCommand:"whoami",challenge:"Use a single command to print the word `linux` to the screen.",solution:"echo linux",content:`# Getting Started with Linux

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
`}],n=[{id:"q-gs-1",lessonId:"getting-started",order:0,prompt:"Which command prints text to the screen?",answer:"echo"},{id:"q-gs-2",lessonId:"getting-started",order:1,prompt:"What does `whoami` tell you?",answer:"user"},{id:"q-fs-1",lessonId:"filesystem-navigation",order:0,prompt:"Which command prints the current working directory?",answer:"pwd"},{id:"q-fs-2",lessonId:"filesystem-navigation",order:1,prompt:'Which symbol means "your home directory"?',answer:"~"},{id:"q-fd-1",lessonId:"files-and-dirs",order:0,prompt:"What flag on `mkdir` creates nested directories?",answer:"-p"},{id:"q-fd-2",lessonId:"files-and-dirs",order:1,prompt:"Which command deletes an empty file?",answer:"rm"},{id:"q-up-1",lessonId:"users-and-permissions",order:0,prompt:"In `chmod 755`, what does the first digit control?",answer:"owner"},{id:"q-up-2",lessonId:"users-and-permissions",order:1,prompt:"True or false: `chmod +x` adds execute permission. (answer: true or false)",answer:"true"},{id:"q-ps-1",lessonId:"processes-and-system",order:0,prompt:"Which command shows a live, updating process list?",answer:"top"},{id:"q-ps-2",lessonId:"processes-and-system",order:1,prompt:"Which signal number forces a kill?",answer:"9"}];function a(){return[...r].sort((e,t)=>e.order-t.order)}function i(e){return n.filter(t=>t.lessonId===e).sort((e,t)=>e.order-t.order)}}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[145,686],()=>s(8970));module.exports=r})();