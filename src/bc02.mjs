import bcrypt from 'bcryptjs';

    const h = await bcrypt.hash('1234',10);
    console.log(h);

    const hashStr = '$2a$10$b3nhpcObOyFhz/MpdFtRUOumPEByfSfFPhRdvL0ObNDifDFBJeEIG';

    console.log(await bcrypt.compare('1234',hashStr));
