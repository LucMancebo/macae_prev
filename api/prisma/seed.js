"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function main() {
    console.log(`Buscando ou criando perfil de Administrador...`);
    // 1. Cria o perfil de acesso
    let perfilAdmin = await prisma_1.prisma.perfilAcesso.findUnique({
        where: { nome: 'ADMINISTRADOR' }
    });
    if (!perfilAdmin) {
        perfilAdmin = await prisma_1.prisma.perfilAcesso.create({
            data: {
                nome: 'ADMINISTRADOR',
                descricao: 'Acesso total ao sistema MACAEPREV',
                permissoes: ["*"]
            }
        });
        console.log(`✅ Perfil ADMINISTRADOR criado com sucesso.`);
    }
    else {
        console.log(`ℹ️ Perfil ADMINISTRADOR já existe.`);
    }
    // 2. Transforma a senha plana em Hash
    const emailAdmin = 'admin@macaeprev.rj.gov.br';
    const senhaPlana = '123456';
    const salt = await bcryptjs_1.default.genSalt(10);
    const senhaHash = await bcryptjs_1.default.hash(senhaPlana, salt);
    console.log(`Buscando ou criando o Usuário Master...`);
    // 3. Upsert do Usuário
    const usuario = await prisma_1.prisma.usuario.upsert({
        where: { email: emailAdmin },
        update: {
            senha_hash: senhaHash,
            status: 'ATIVO'
        },
        create: {
            nome: 'Administrador Master',
            email: emailAdmin,
            senha_hash: senhaHash,
            status: 'ATIVO',
            perfil_id: perfilAdmin.id,
            mfa_habilitado: false
        }
    });
    // 4. Cria um Termo de Uso inicial
    console.log(`Buscando ou criando Termos de Uso (LGPD)...`);
    await prisma_1.prisma.termoUso.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            versao: '1.0',
            conteudo: 'Este é o Termo de Uso e Política de Privacidade do MACAEPREV...',
            publicado: true
        }
    });
    console.log(`✅ Usuário e Termos criados com sucesso!`);
}
main()
    .then(async () => {
    await prisma_1.prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
