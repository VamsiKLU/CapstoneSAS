package io.pipelinehub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "admin.email=test-admin@pipelinehub.io",
    "admin.password=TestAdmin123!",
    "github.client-id=test-id",
    "github.client-secret=test-secret",
    "frontend.url=http://localhost:5173"
})
class PipelineHubApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context starts without errors
    }
}
