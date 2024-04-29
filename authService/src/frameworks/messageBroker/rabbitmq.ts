import amqp from "amqplib";
import { AuthEntity } from "../../entity/auth.entity";

export class Rabiitmq {
  private Connection: amqp.Connection | null = null;
  private Channel: amqp.Channel | null = null;
  private correlationIdMap: Map<string, (response: any) => void> = new Map();

  async initialize() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
      this.Connection = await amqp.connect(rabbitmqUrl);
      this.Channel = await this.Connection.createChannel();
      console.log("The connection is established");
    } catch (e) {
      console.error("The connection is not established");
      process.exit(1);
    }
  }


  async changePasswordPublisher(userData: AuthEntity) {
    if (!this.Channel) {
      await this.initialize();
    }
    if (this.Channel) {
      const queue = "changePass";
      await this.Channel.assertQueue(queue, { durable: true });
      this.Channel.sendToQueue(queue, Buffer.from(JSON.stringify(userData)));
      console.log(`The change password request passed successfully`,userData,queue);
    } else {
      console.error("Failed to create a channel");
    }
  }

  async messagePublisher(userData: AuthEntity) {
    if (!this.Channel) {
      await this.initialize();
    }
    if (this.Channel) {
      const queue = "messageDataQueue";
      await this.Channel.assertQueue(queue, { durable: true });
      this.Channel.sendToQueue(queue, Buffer.from(JSON.stringify(userData)));
      console.log(`To message service data is passed `,userData,queue);
    } else {
      console.error("Failed to create a channel");
    }
  }

  async userRegPublisher(userData: AuthEntity) {
    if (!this.Channel) {
      await this.initialize();
    }
    if (this.Channel) {
      const queue = "userReg";
      await this.Channel.assertQueue(queue, { durable: true });

      this.Channel.sendToQueue(queue, Buffer.from(JSON.stringify(userData)));

      console.log(`The user data passed successfully`);
    } else {
      console.error("Failed to create a channel");
    }
  }

  async publishGoogleAuthData(authData : AuthEntity) {
    try {
      if (!this.Connection || !this.Channel) {
        await this.initialize();
      }
      const correlationId = this.generateCorrelationId();
      const message = JSON.stringify(authData);
      await this.Channel.assertQueue("google_response", { durable: false });
      this.googleConsumeResponseQueue();
      const responsePromise = new Promise(resolve => {
        this.correlationIdMap.set(correlationId, resolve);
      });
      await this.Channel.assertQueue("google_auth_queue", { durable: false });
      await this.Channel.sendToQueue("google_auth_queue", Buffer.from(message), {
        correlationId,
        replyTo: "google_response",
      });
      const response = await responsePromise;
      console.log("Received response from RabbitMQ:", response);
      if (response === "false") {
        return null;
      }
      return response;
    } catch (error) {
      console.error("Error publishing message:", error);
      throw error;
    }
  }
  

  async publishLoginData(loginData: AuthEntity): Promise<void> {
    try {
      if (!this.Connection || !this.Channel) {
        await this.initialize();
      }

      const correlationId = this.generateCorrelationId();
      const message = JSON.stringify(loginData);
      await this.Channel.assertQueue("response_queue", { durable: false });
      this.consumeResponseQueue();

      const responsePromise = new Promise<any>((resolve) => {
        this.correlationIdMap.set(correlationId, resolve);
      });

      await this.Channel.assertQueue("login_queue", { durable: false });
      await this.Channel.sendToQueue("login_queue", Buffer.from(message), {
        correlationId,
        replyTo: "response_queue",
      });

      const response = await responsePromise;
      console.log(response, "the rabbit response");
      if (response == "false") {
        return null;
      }
      return response;
    } catch (error) {
      console.error("Error publishing message:", error);
      throw error;
    }
  }

  private generateCorrelationId(): string {
    return Math.random().toString() + Date.now().toString();
  }

  private waitForResponse(correlationId: string): Promise<any> {
    return new Promise((resolve) => {
      this.correlationIdMap.set(correlationId, resolve);
    });
  }

  private handleResponse(correlationId: string, response: any): void {
    const resolveFunction = this.correlationIdMap.get(correlationId);
    if (resolveFunction) {
      resolveFunction(response);
      this.correlationIdMap.delete(correlationId);
    }
  }

  async consumeResponseQueue(): Promise<void> {
    try {
      if (!this.Connection || !this.Channel) {
        await this.initialize();
      }

      this.Channel.consume(
        "response_queue",
        (msg) => {
          if (msg && msg.properties.correlationId) {
            const correlationId = msg.properties.correlationId;
            const response = msg.content.toString();
            console.log("Received response:", response);

            this.handleResponse(correlationId, response);
          }
        },
        { noAck: true }
      );
    } catch (error) {
      console.error("Error consuming response queue:", error);
      throw error;
    }
  }

  async googleConsumeResponseQueue(): Promise<void> {
    try {
      if (!this.Connection || !this.Channel) {
        await this.initialize();
      }

      this.Channel.consume(
        "google_response",
        (msg) => {
          if (msg && msg.properties.correlationId) {
            const correlationId = msg.properties.correlationId;
            const response = msg.content.toString();
            console.log("Received response:", response);

            this.handleResponse(correlationId, response);
          }
        },
        { noAck: true }
      );
    } catch (error) {
      console.error("Error consuming response queue:", error);
      throw error;
    }
  }
}
