import { Lock, ShieldCheck, Award, Eye } from "lucide-react";

export function TrustBadges() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 py-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-all duration-300 ease-out">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="font-medium">SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-all duration-300 ease-out">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-medium">LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-all duration-300 ease-out">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="font-medium">7 Dias Garantia</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-all duration-300 ease-out">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="font-medium">100% Privado</span>
            </div>
        </div>
    );
}
