import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log(`Buscando ou criando perfil de Administrador...`);

    // 1. Cria o perfil de acesso
    let perfilAdmin = await prisma.perfilAcesso.findUnique({
        where: { nome: 'ADMINISTRADOR' }
    });

    if (!perfilAdmin) {
        perfilAdmin = await prisma.perfilAcesso.create({
            data: {
                nome: 'ADMINISTRADOR',
                descricao: 'Acesso total ao sistema MACAEPREV',
                permissoes: JSON.parse('["*"]') // Todas as permissões
            }
        });
        console.log(`✅ Perfil ADMINISTRADOR criado com sucesso.`);
    } else {
        console.log(`ℹ️ Perfil ADMINISTRADOR já existe.`);
    }

    // 2. Transforma a senha plana em Hash para a LGPD
    const emailAdmin = 'admin@macaeprev.rj.gov.br';
    const senhaPlana = '123456';
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaPlana, salt);

    console.log(`Buscando ou criando o Usuário Master...`);

    // 3. Upsert do Usuário (se já existir, atualiza a senha, se não cria um novo)
    const usuario = await prisma.usuario.upsert({
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

    // 4. Cria um Termo de Uso inicial para a LGPD
    console.log(`Buscando ou criando Termos de Uso (LGPD)...`);
    await prisma.termoUso.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            versao: '1.0',
            conteudo: 'Este é o Termo de Uso e Política de Privacidade do MACAEPREV. Ao aceitar, você concorda com o processamento de seus dados para fins de gestão de consignações conforme a LGPD.',
            publicado: true
        }
    });

    console.log(`✅ Usuário e Termos criados/atualizados com sucesso!`);
    console.log(`-------------------------------------------`);
    console.log(`E-mail Teste: ${usuario.email}`);
    console.log(`Senha Plana.: ${senhaPlana}`);
    console.log(`Id Usuário..: ${usuario.id}`);
    console.log(`-------------------------------------------`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Erro no seed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
