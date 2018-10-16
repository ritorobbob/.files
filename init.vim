" Specify a directory for plugins
" - For Neovim: ~/.local/share/nvim/plugged
" - Avoid using standard Vim directory names like 'plugin'
call plug#begin('~/.local/share/nvim/plugged')

if has('nvim')
  Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
else
  Plug 'Shougo/deoplete.nvim'
  Plug 'roxma/nvim-yarp'
  Plug 'roxma/vim-hug-neovim-rpc'
endif

Plug 'zchee/deoplete-jedi'
Plug 'zchee/deoplete-clang'

Plug 'junegunn/seoul256.vim'
Plug 'lilydjwg/colorizer'
call plug#end()
colo seoul256

let g:deoplete#enable_at_startup = 1
"must set the path to clang with this command: ([sudo] find / -name libclang.so)
let g:deoplete#sources#clang#libclang_path = '/usr/lib/llvm-6.0/lib/libclang.so'

" General
set number
set relativenumber
set encoding=utf-8
set linebreak
set showbreak=+++
set textwidth=100
set showmatch
set visualbell

set hlsearch
set smartcase
set ignorecase
set incsearch

set autoindent
set shiftwidth=4
set smartindent
set smarttab
set softtabstop=4

" Advanced
set ruler
set wildmode=longest,list,full
set wildmenu

filetype indent on
filetype plugin on

syntax on

set undolevels=1000
set backspace=indent,eol,start

hi Normal guibg=NONE ctermbg=NONE
hi LineNR guibg=NONE ctermbg=NONE
hi CursorLineNr guibg=NONE ctermbg=NONE

nnoremap !! :w <CR> :! ~/.scripts/Compile.sh % <CR>
nnoremap <Esc> :noh <CR>
