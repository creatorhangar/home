export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl aspect-[4/3] w-full overflow-hidden">
            <div className="p-8 flex items-center justify-center h-full">
              <img
                alt="User interface of the background removal tool"
                className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop"
              />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Como funciona: Edição em lote com privacidade
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Seus arquivos e imagens nunca são enviados para a nuvem. Nós nunca vemos seus dados, pois todo o processamento acontece diretamente no seu computador.
          </p>

          <div className="space-y-4">
            {[
              { num: 1, title: "Selecione suas imagens", desc: "Arraste e solte centenas ou milhares de imagens diretamente na ferramenta." },
              { num: 2, title: "Aplique as edições", desc: "Escolha a ação desejada: remover fundo, redimensionar, converter, etc." },
              { num: 3, title: "Exporte o resultado", desc: "Baixe todas as imagens processadas instantaneamente, sem filas ou uploads." },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
