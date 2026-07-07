2:I[2332,["972","static/chunks/972-004c2affa224a9e1.js","961","static/chunks/961-4d28302ea5045570.js","648","static/chunks/648-f5089af57a8b7401.js","697","static/chunks/app/lessons/%5Bslug%5D/page-03b14b4e8f12fc38.js"],"LessonDetailClient"]
5:I[4707,[],""]
7:I[6423,[],""]
8:I[2043,["972","static/chunks/972-004c2affa224a9e1.js","648","static/chunks/648-f5089af57a8b7401.js","185","static/chunks/app/layout-b24f3fd1080b61e8.js"],"ProgressProvider"]
9:I[6294,["972","static/chunks/972-004c2affa224a9e1.js","648","static/chunks/648-f5089af57a8b7401.js","185","static/chunks/app/layout-b24f3fd1080b61e8.js"],"KeyboardShortcuts"]
a:I[9812,["972","static/chunks/972-004c2affa224a9e1.js","648","static/chunks/648-f5089af57a8b7401.js","185","static/chunks/app/layout-b24f3fd1080b61e8.js"],"CommandPalette"]
b:I[2972,["972","static/chunks/972-004c2affa224a9e1.js","648","static/chunks/648-f5089af57a8b7401.js","931","static/chunks/app/page-8e1f1c347189b964.js"],""]
c:I[7569,["972","static/chunks/972-004c2affa224a9e1.js","648","static/chunks/648-f5089af57a8b7401.js","185","static/chunks/app/layout-b24f3fd1080b61e8.js"],"ThemeToggle"]
d:I[6233,["972","static/chunks/972-004c2affa224a9e1.js","648","static/chunks/648-f5089af57a8b7401.js","185","static/chunks/app/layout-b24f3fd1080b61e8.js"],"ResetProgressButton"]
3:T41a,# Filesystem Navigation

Linux organises everything under a single root directory `/`. Unlike Windows, there are no drive letters; everything branches off `/`.

## Three commands you will use constantly

| Command | What it does                  | Example         |
| ------- | ----------------------------- | --------------- |
| `pwd`   | Print current directory       | `pwd`          |
| `ls`    | List files in current dir     | `ls -la`       |
| `cd`    | Change directory              | `cd /tmp`      |

## Paths

- **Absolute paths** start at `/`, e.g. `/home/learner`.
- **Relative paths** start from where you are, e.g. `../projects`.

Special directory shortcuts:

- `.` - the current directory
- `..` - the parent directory
- `~` - your home directory

## Try it

```bash
pwd                # shows something like /home/learner
ls                 # list contents
ls -la             # long format, including hidden files
cd /tmp            # jump to /tmp
pwd                # confirm you're now in /tmp
cd ~               # back home
```
4:T492,# Getting Started with Linux

**Linux** is a free, open-source operating system kernel that powers everything from phones to supercomputers. Most servers on the internet run Linux, and it is the single most important skill for anyone in DevOps, cloud, or backend development.

## What is the shell?

The **shell** is a program that takes commands from your keyboard and gives them to the operating system. The most common shell on Linux is called **bash**.

When you open a terminal, you see a *prompt* that ends with a dollar sign `$`. Everything you type after that prompt is a command.

## Your first commands

Try these in the terminal on the right:

```bash
whoami          # show your current user
date            # show the current date and time
echo hello      # print "hello"
clear           # clear the screen
```

> Lines that start with `#` are **comments**; the shell ignores them. They are just for you.

## Why learn the command line?

- Far faster than clicking through menus.
- Automatable; write a **script** once, run it forever.
- Works the same on a tiny VM or a giant cluster.

When you're ready, hit **Mark complete** and move to the next lesson.
6:["slug","filesystem-navigation","d"]
0:["69AMh68JQTmj0xEH5VSgd",[[["",{"children":["lessons",{"children":[["slug","filesystem-navigation","d"],{"children":["__PAGE__?{\"slug\":\"filesystem-navigation\"}",{}]}]}]},"$undefined","$undefined",true],["",{"children":["lessons",{"children":[["slug","filesystem-navigation","d"],{"children":["__PAGE__",{},[["$L1",["$","$L2",null,{"lesson":{"id":"filesystem-navigation","slug":"filesystem-navigation","title":"Filesystem Navigation","description":"Move around the filesystem with `pwd`, `ls`, and `cd`.","difficulty":"beginner","order":2,"trackCommand":"ls","challenge":"From `/home/learner`, change into the `projects` directory.","solution":"cd projects","content":"$3"},"neighbours":{"previous":{"id":"getting-started","slug":"getting-started","title":"Getting Started with Linux","description":"What Linux is, the shell, and your first commands.","difficulty":"beginner","order":1,"trackCommand":"whoami","challenge":"Use a single command to print the word `linux` to the screen.","solution":"echo linux","content":"$4"},"next":{"id":"files-and-dirs","slug":"files-and-dirs","title":"Creating and Manipulating Files","description":"touch, mkdir, cp, mv, rm - the core file operations.","difficulty":"beginner","order":3,"trackCommand":"mkdir","challenge":"Create a new directory called `lab` and then create an empty file `lab/notes.txt` inside it. Do it in two commands.","solution":"mkdir lab && touch lab/notes.txt","content":"# Creating and Manipulating Files\n\nIn this lesson you'll learn the everyday verbs for working with files and directories.\n\n## Make\n\n```bash\nmkdir projects          # create a directory\nmkdir -p a/b/c          # create nested directories (-p = parents)\ntouch notes.txt         # create an empty file (or update timestamp)\n```\n\n## Inspect\n\n```bash\ncat notes.txt           # print file contents\nless notes.txt          # page through a file (q to quit)\nhead -n 5 notes.txt     # first 5 lines\nwc -l notes.txt         # count lines\n```\n\n## Move / copy / delete\n\n```bash\ncp notes.txt copy.txt        # copy\nmv notes.txt renamed.txt     # rename / move\nrm renamed.txt               # delete a file\nrm -r projects               # delete a directory recursively\n```\n\n> Warning: `rm` is **permanent**. There is no recycle bin. Triple-check before running `rm -rf /`.\n\n## Edit\n\nYou'll often edit files straight from the terminal:\n\n- `nano notes.txt` - beginner-friendly editor\n- `vim notes.txt` - powerful but steep learning curve\n"}},"position":{"index":1,"total":5},"questions":[{"id":"q-fs-1","lessonId":"filesystem-navigation","order":0,"prompt":"Which command prints the current working directory?","answer":"pwd"},{"id":"q-fs-2","lessonId":"filesystem-navigation","order":1,"prompt":"Which symbol means \"your home directory\"?","answer":"~"}]}],null],null],null]},[null,["$","$L5",null,{"parallelRouterKey":"children","segmentPath":["children","lessons","children","$6","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[null,["$","$L5",null,{"parallelRouterKey":"children","segmentPath":["children","lessons","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/Learninx/_next/static/css/ae9dc10f4b15d7e9.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":["$","script",null,{"dangerouslySetInnerHTML":{"__html":"(function(){try{var t=localStorage.getItem('learninx_theme');if(!t){t=matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();"}}]}],["$","body",null,{"suppressHydrationWarning":true,"children":[["$","a",null,{"href":"#main","className":"lx-skip-link","children":"Skip to content"}],["$","$L8",null,{"children":[["$","$L9",null,{}],["$","$La",null,{}],["$","header",null,{"className":"sticky top-0 z-30 border-b border-[var(--lx-border)] bg-[var(--lx-nav-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--lx-nav-bg)]","children":["$","nav",null,{"aria-label":"Primary","className":"mx-auto flex max-w-6xl items-center justify-between px-4 py-3","children":[["$","$Lb",null,{"href":"/","className":"group flex items-center gap-2 font-semibold text-lg","children":[["$","span",null,{"aria-hidden":true,"className":"font-mono text-[var(--lx-accent)] transition-transform group-hover:translate-x-0.5","children":"~$"}],["$","span",null,{"children":["learn",["$","span",null,{"className":"text-[var(--lx-accent)]","children":"inx"}]]}]]}],["$","div",null,{"className":"flex items-center gap-1 text-sm sm:gap-2","children":[["$","$Lb",null,{"href":"/lessons","className":"rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)]","children":[["$","span",null,{"className":"hidden sm:inline","children":"Lessons"}],["$","svg",null,{"width":16,"height":16,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","aria-hidden":true,"focusable":false,"suppressHydrationWarning":true,"className":"sm:hidden","children":[["$","path",null,{"d":"m4 17 6-6-6-6"}],["$","path",null,{"d":"M12 19h8"}]]}]]}],["$","$Lb",null,{"href":"/cheatsheet","className":"hidden rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-block","children":"Cheatsheet"}],["$","$Lc",null,{}],["$","a",null,{"href":"https://github.com/raveendra11/Learninx","target":"_blank","rel":"noreferrer","className":"hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-[var(--lx-muted)] transition hover:bg-[var(--lx-accent-glow)] hover:text-[var(--lx-accent)] sm:inline-flex","children":[["$","svg",null,{"width":14,"height":14,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","aria-hidden":true,"focusable":false,"suppressHydrationWarning":true,"children":["$","path",null,{"d":"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"}]}]," GitHub"]}],["$","div",null,{"className":"hidden md:block","children":["$","$Ld",null,{}]}]]}]]}]}],["$","main",null,{"id":"main","className":"mx-auto w-full max-w-6xl px-4 py-8 md:py-10","children":["$","$L5",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":["$","div",null,{"className":"mx-auto max-w-xl py-16 text-center","children":[["$","div",null,{"className":"mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]","children":[["$","svg",null,{"width":12,"height":12,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","aria-hidden":true,"focusable":false,"suppressHydrationWarning":true,"children":[["$","path",null,{"d":"m4 17 6-6-6-6"}],["$","path",null,{"d":"M12 19h8"}]]}]," 404"]}],["$","h1",null,{"className":"text-4xl font-bold tracking-tight sm:text-5xl","children":"No such command."}],["$","p",null,{"className":"mx-auto mt-3 max-w-md text-slate-400","children":"We could not find that page. The link might be stale, or the lesson may have been renamed."}],["$","div",null,{"className":"mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row","children":[["$","$Lb",null,{"href":"/lessons","className":"lx-btn lx-btn-primary","children":["Browse lessons ",["$","svg",null,{"width":14,"height":14,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","aria-hidden":true,"focusable":false,"suppressHydrationWarning":true,"children":["$","path",null,{"d":"M5 12h14M13 5l7 7-7 7"}]}]]}],["$","$Lb",null,{"href":"/","className":"lx-btn lx-btn-secondary","children":"Back home"}]]}],["$","pre",null,{"className":"mt-10 inline-block rounded-md border border-slate-800 bg-slate-950/80 px-4 py-3 text-left font-mono text-xs text-slate-400","children":"$$ open {path}\nbash: {path}: No such file or directory"}]]}],"notFoundStyles":[]}]}],["$","footer",null,{"className":"mx-auto mt-12 max-w-6xl px-4 py-8 text-center text-xs text-slate-500","children":[["$","p",null,{"children":"Built for learning Linux · open source · no signup, no tracking"}],["$","p",null,{"className":"mt-1 text-slate-600","children":["Press ",["$","span",null,{"className":"lx-kbd","children":"g"}]," then"," ",["$","span",null,{"className":"lx-kbd","children":"l"}]," to jump to lessons"]}]]}]]}]]}]]}]],null],[["$","div",null,{"className":"flex flex-col items-center justify-center gap-3 py-24 text-slate-400","children":[["$","div",null,{"className":"flex items-center gap-1 font-mono text-sm","children":[["$","span",null,{"className":"text-[var(--lx-accent)]","children":"~"}],["$","span",null,{"className":"text-slate-500","children":"$$"}],["$","span",null,{"className":"ml-2 inline-flex","children":[["$","span",null,{"className":"animate-pulse","children":"."}],["$","span",null,{"className":"animate-pulse [animation-delay:120ms]","children":"."}],["$","span",null,{"className":"animate-pulse [animation-delay:240ms]","children":"."}]]}]]}],["$","p",null,{"className":"flex items-center gap-1.5 text-xs text-slate-500","children":[["$","svg",null,{"width":12,"height":12,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round","aria-hidden":true,"focusable":false,"suppressHydrationWarning":true,"children":[["$","path",null,{"d":"m4 17 6-6-6-6"}],["$","path",null,{"d":"M12 19h8"}]]}]," Booting the sandbox"]}]]}],[],[]]],["$Le",null]]]]
e:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"name":"theme-color","content":"#0b0f12"}],["$","meta","2",{"charSet":"utf-8"}],["$","title","3",{"children":"Learninx — Learn Linux the Easy Way"}],["$","meta","4",{"name":"description","content":"An interactive Linux learning platform with in-browser terminal, lessons, and quizzes. No signup required."}],["$","link","5",{"rel":"icon","href":"/favicon.svg"}]]
1:null
