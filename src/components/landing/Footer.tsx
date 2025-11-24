import Link from "next/link";

export function Footer() {
    return (
        <footer className="pt-20 pb-8 border-t border-gray-200">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold font-display text-primary">Creative Hangar</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-xs">
                        Hub de ferramentas de design e produtividade 100% offline para criativos modernos.
                    </p>
                    <div className="mt-6 flex space-x-4">
                        <Link href="#" className="text-gray-400 hover:text-primary">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-primary">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fillRule="evenodd" />
                            </svg>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-primary">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.161 1.043c-1.049.046-1.654.21-2.185.41a3.896 3.896 0 00-1.396.924 3.896 3.896 0 00-.924 1.396c-.2 1.53-.41 1.135-.41 2.185-.046 1.025-.06 1.37-.06 3.808 0 2.438.014 2.784.06 3.809.046 1.05.21 1.654.41 2.185a3.896 3.896 0 00.924 1.396 3.896 3.896 0 001.396.924c1.53.2 1.135.41 2.185.41 1.025.046 1.37.06 3.809.06s2.784-.014 3.809-.06c1.05-.046 1.654-.21 2.185-.41a3.896 3.896 0 001.396-.924 3.896 3.896 0 00.924-1.396c.2-1.53.41-1.135.41-2.185.046-1.025.06-1.37.06-3.809 0-2.438-.014-2.784-.06-3.808-.046-1.05-.21-1.654-.41-2.185a3.896 3.896 0 00-.924-1.396 3.896 3.896 0 00-1.396-.924c-.531-.2-1.135-.41-2.185-.41-1.025-.046-1.37-.06-3.809-.06s-2.784.014-3.809.06zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 1.802a3.333 3.333 0 110 6.666 3.333 3.333 0 010-6.666zm5.338-3.205a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" fillRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900">Ferramentas</h4>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Removedor de Fundo</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Vetorizador de Imagem</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Redimensionar e Comprimir</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Ver Todas</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900">Recursos</h4>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Blog</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Central de Ajuda</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Contato</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900">Empresa</h4>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Sobre Nós</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Política de Privacidade</Link></li>
                        <li><Link href="#" className="text-gray-600 hover:text-primary">Termos de Serviço</Link></li>
                    </ul>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Creative Hangar. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}
