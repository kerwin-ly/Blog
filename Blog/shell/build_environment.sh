#!/usr/bin/env bash

function echo_green_word()
{
    echo "\033[32mbuild_environment.sh: $1\033[0m"
}

function welcome()
{
    echo_green_word "This script will install"
    echo_green_word "[Xcode] The missing package manager for macOS, see more in https://developer.apple.com/xcode/"
    echo_green_word "[brew] The missing package manager for macOS, see more in https://brew.sh"
    echo_green_word "[oh-my-zsh] Zsh is a shell designed for interactive use, see more in https://github.com/robbyrussell/oh-my-zsh"
    echo_green_word "[Visual Studio Code] The best editor in the universe, see more in https://code.visualstudio.com"
    echo_green_word "[Nodejs] JavaScript runtime built on Chrome's V8 JavaScript engine, see more in https://nodejs.org/"
    echo_green_word "[Docker] Enterprise Container Platform, see more in https://www.docker.com"
}

function install_if_command_not_exists()
{
    if ! type $1 &> /dev/null; then
        echo_green_word "Installing $1..."
        bash -c "$2"
    else
        echo_green_word "$1 has been installed, abort!"
    fi
}

function install_if_dir_not_exists()
{
    if ls -la $2 | grep "$3" &> /dev/null; then
        echo_green_word "$1 has been installed, abort!"
    else
        echo_green_word "Installing $1 ..."
        bash -c "$4"
    fi
}


# welcome

# Xcode
xcode-select --install

install_if_command_not_exists brew '/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"'


echo_green_word "Change brew repo..."
cd "$(brew --repo)"
git remote set-url origin https://mirrors.ustc.edu.cn/brew.git
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git
echo_green_word "Updating brew..."
brew update


install_if_dir_not_exists "VSCode" "/Applications" "Visual\ Studio\ Code.app" "brew cask install visual-studio-code"

declare -a extensions=("esbenp.prettier-vscode" "dbaeumer.vscode-eslint" "eg2.tslint" "mkaufman.HTMLHint" "shinnn.stylelint" "joelday.docthis" "johnpapa.Angular2" "cipchk.ng-zorro-vscode" "cipchk.cipchk.ng-alain-vscode" "Mikael.Angular-BeastCode" "formulahendry.auto-rename-tag" "MS-CEINTL.vscode-language-pack-zh-hans")

for extension in "${extensions[@]}"
do
    echo "Installing ${extension} for VSCode..."
    /Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code --install-extension ${extension}
done


install_if_command_not_exists node "brew install node"

# Nodejs
install_if_command_not_exists cnpm "sudo npm install -g cnpm --registry=https://registry.npm.taobao.org"

declare -a packages=("n" "gulp" "typescript")

for package in "${packages[@]}"
do
    install_if_command_not_exists ${package} "sudo cnpm i -g ${package}"
done

install_if_dir_not_exists "oh-my-zsh" ~ ".oh-my-zsh" 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"'

install_if_command_not_exists docker "brew install docker docker-compose docker-machine xhyve docker-machine-driver-xhyve"

welcome